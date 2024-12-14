/**
 * Virtual Memory Dashboard
 * A comprehensive memory analysis tool
 */

/******************************************************************************
 * Includes and Definitions
 ******************************************************************************/
#define _POSIX_C_SOURCE 199309L  // Required for CLOCK_MONOTONIC

#include <stdio.h>
#include <stdlib.h>
#include <unistd.h>
#include <string.h>
#include <pthread.h>
#include <dirent.h>
#include <sys/stat.h>
#include <sys/resource.h>
#include <sys/sysinfo.h>
#include <time.h>
#include <execinfo.h>
#include <limits.h>
#include <json-c/json.h>
#include <math.h>

#define MAX_LINE_LENGTH 256
#define STACK_TRACE_DEPTH 20
#define ANALYTICS_UPDATE_INTERVAL 1 // seconds

/******************************************************************************
 * Type Definitions
 ******************************************************************************/
// Memory block structure for leak tracking
typedef struct MemoryBlock {
    void* ptr;
    size_t size;
    const char* file;
    int line;
    struct MemoryBlock* next;
} MemoryBlock;

// Structure for memory analytics
typedef struct {
    // Memory Fragmentation
    size_t total_memory;
    size_t free_memory;
    size_t largest_free_block;
    double fragmentation_index;
    
    // Page Faults
    long major_faults;
    long minor_faults;
    double fault_rate;
    
    // Memory Pressure
    double pressure_score;
    int swap_usage_percent;
    
    // Memory Timeline
    struct timespec last_update;
    size_t memory_usage;
    size_t peak_usage;
} MemoryAnalytics;

// Structure for memory allocation tracking
typedef struct MemoryAllocation {
    void* address;
    size_t size;
    char* stack_trace;
    time_t timestamp;
    struct MemoryAllocation* next;
} MemoryAllocation;

/******************************************************************************
 * Global Variables
 ******************************************************************************/
static pthread_mutex_t g_mutex = PTHREAD_MUTEX_INITIALIZER;
static pthread_mutex_t g_analytics_mutex = PTHREAD_MUTEX_INITIALIZER;
static MemoryBlock* g_memory_block_head = NULL;
static MemoryAnalytics g_analytics = {0};

// Analytics tracking variables
static struct timespec g_last_check_time = {0};
static long g_last_major_faults = 0;
static long g_last_minor_faults = 0;

/******************************************************************************
 * Function Declarations
 ******************************************************************************/
// Memory Tracking
void* tracked_malloc(size_t size, const char* filename, int line);
void tracked_free(void* ptr);
void detect_memory_leaks(const char* file_name);

// System Memory Analysis
void analyze_system_memory(void);
void display_memory_mapping(void);

// Process Memory Analysis
void analyze_process_memory(void);
void display_memory_usage(pid_t pid);

// Analytics
void init_analytics(void);
void update_analytics(void);
void analyze_memory_advanced(void);


/******************************************************************************
 * Implementation - Memory Tracking Functions
 ******************************************************************************/
void* tracked_malloc(size_t size, const char* filename, int line) {
    void* ptr = malloc(size);
    if (ptr != NULL) {
        MemoryBlock* block = malloc(sizeof(MemoryBlock));
        if (block == NULL) return ptr;

        block->ptr = ptr;
        block->size = size;
        block->file = filename;
        block->line = line;

        pthread_mutex_lock(&g_mutex);
        block->next = g_memory_block_head;
        g_memory_block_head = block;
        pthread_mutex_unlock(&g_mutex);

        // Update peak memory usage
        pthread_mutex_lock(&g_analytics_mutex);
        g_analytics.memory_usage += size;
        if (g_analytics.memory_usage > g_analytics.peak_usage) {
            g_analytics.peak_usage = g_analytics.memory_usage;
        }
        pthread_mutex_unlock(&g_analytics_mutex);
    }
    return ptr;
}

void tracked_free(void* ptr) {
    if (ptr == NULL) return;

    pthread_mutex_lock(&g_mutex);
    MemoryBlock* prev = NULL;
    MemoryBlock* curr = g_memory_block_head;
    
    while (curr != NULL && curr->ptr != ptr) {
        prev = curr;
        curr = curr->next;
    }

    if (curr != NULL) {
        if (prev != NULL) prev->next = curr->next;
        else g_memory_block_head = curr->next;

        pthread_mutex_lock(&g_analytics_mutex);
        g_analytics.memory_usage -= curr->size;
        pthread_mutex_unlock(&g_analytics_mutex);

        free(curr);
    }
    pthread_mutex_unlock(&g_mutex);
    free(ptr);
}

/******************************************************************************
 * Implementation - Analytics Functions
 ******************************************************************************/
void init_analytics(void) {
    clock_gettime(CLOCK_MONOTONIC, &g_last_check_time);
    struct rusage usage;
    if (getrusage(RUSAGE_SELF, &usage) == 0) {
        g_last_major_faults = usage.ru_majflt;
        g_last_minor_faults = usage.ru_minflt;
    }
}

void update_analytics(void) {
    struct timespec current_time;
    clock_gettime(CLOCK_MONOTONIC, &current_time);

    // Calculate time difference for fault rate
    double time_diff = (current_time.tv_sec - g_last_check_time.tv_sec) +
                      (current_time.tv_nsec - g_last_check_time.tv_nsec) / 1e9;

    // Update page faults
    struct rusage usage;
    if (getrusage(RUSAGE_SELF, &usage) == 0) {
        g_analytics.major_faults = usage.ru_majflt - g_last_major_faults;
        g_analytics.minor_faults = usage.ru_minflt - g_last_minor_faults;
        g_analytics.fault_rate = (g_analytics.major_faults + g_analytics.minor_faults) / time_diff;

        g_last_major_faults = usage.ru_majflt;
        g_last_minor_faults = usage.ru_minflt;
    }

    // Read memory info directly from /proc/meminfo
    FILE *meminfo = fopen("/proc/meminfo", "r");
    if (meminfo) {
        char line[256];
        unsigned long memTotal = 0, memFree = 0, memAvailable = 0, cached = 0, buffers = 0;
        
        while (fgets(line, sizeof(line), meminfo)) {
            if (strncmp(line, "MemTotal:", 9) == 0)
                sscanf(line, "MemTotal: %lu", &memTotal);
            else if (strncmp(line, "MemFree:", 8) == 0)
                sscanf(line, "MemFree: %lu", &memFree);
            else if (strncmp(line, "MemAvailable:", 12) == 0)
                sscanf(line, "MemAvailable: %lu", &memAvailable);
            else if (strncmp(line, "Cached:", 7) == 0)
                sscanf(line, "Cached: %lu", &cached);
            else if (strncmp(line, "Buffers:", 8) == 0)
                sscanf(line, "Buffers: %lu", &buffers);
        }
        fclose(meminfo);

        // Convert KB to bytes
        g_analytics.total_memory = memTotal * 1024;
        g_analytics.free_memory = memAvailable * 1024;  // Use MemAvailable instead of MemFree
        g_analytics.memory_usage = (memTotal - memAvailable) * 1024;

        // Calculate fragmentation index
        g_analytics.fragmentation_index = 1.0 - ((double)memAvailable / memTotal);

        // Calculate memory pressure
        double mem_used_percent = 1.0 - ((double)memAvailable / memTotal);
        
        // Get swap info
        struct sysinfo si;
        if (sysinfo(&si) == 0) {
            double swap_used_percent = si.totalswap ? 
                1.0 - ((double)si.freeswap / si.totalswap) : 0;

            g_analytics.pressure_score = 
                (mem_used_percent * 0.7) + (swap_used_percent * 0.3);
            g_analytics.swap_usage_percent = 
                (int)(swap_used_percent * 100);
        }
    }

    g_last_check_time = current_time;
}

void analyze_memory_advanced(void) {
    static int initialized = 0;
    if (!initialized) {
        init_analytics();
        initialized = 1;
    }

    update_analytics();

    // Ensure valid values for JSON output
    double fault_rate = isfinite(g_analytics.fault_rate) ? g_analytics.fault_rate : 0.0;

    // Clear any buffered output first
    fflush(stdout);
    
    // Output JSON directly without menu text
    printf("{\n");
    printf("  \"fragmentation_index\": %.2f,\n", g_analytics.fragmentation_index);
    printf("  \"fault_rate\": %.2f,\n", fault_rate);
    printf("  \"pressure_score\": %.2f,\n", g_analytics.pressure_score);
    printf("  \"swap_usage_percent\": %d,\n", g_analytics.swap_usage_percent);
    printf("  \"major_faults\": %ld,\n", g_analytics.major_faults);
    printf("  \"minor_faults\": %ld,\n", g_analytics.minor_faults);
    printf("  \"memory_usage\": %zu,\n", g_analytics.memory_usage);
    printf("  \"total_memory\": %zu,\n", g_analytics.total_memory);
    printf("  \"free_memory\": %zu\n", g_analytics.free_memory);
    printf("}\n");
    fflush(stdout);
    exit(0);
}

/******************************************************************************
 * Implementation - System Memory Analysis Functions
 ******************************************************************************/
void analyze_system_memory(void) {
    FILE *meminfo_file = fopen("/proc/meminfo", "r");
    if (meminfo_file == NULL) {
        perror("Error opening /proc/meminfo");
        return;
    }

    char line[MAX_LINE_LENGTH];
    printf("System-wide Memory Information:\n");
    while (fgets(line, sizeof(line), meminfo_file)) {
        printf("%s", line);
    }
    fclose(meminfo_file);
}

void display_memory_mapping(void) {
    FILE *fp = fopen("/proc/self/maps", "r");
    if (fp == NULL) {
        printf("Failed to open /proc/self/maps\n");
        return;
    }

    char line[MAX_LINE_LENGTH];
    printf("Virtual Memory Mapping:\n");
    while (fgets(line, sizeof(line), fp) != NULL) {
        printf("%s", line);
    }
    fclose(fp);
}

/******************************************************************************
 * Implementation - Process Memory Analysis Functions
 ******************************************************************************/
void display_memory_usage(pid_t pid) {
    char command[50];
    snprintf(command, sizeof(command), "pmap -x %d", pid);
    printf("Process-wise memory usage:\n");
    fflush(stdout);
    system(command);
}

void analyze_process_memory(void) {
    pid_t pid = getpid();
    display_memory_usage(pid);
}

/******************************************************************************
 * Main Program
 ******************************************************************************/
void print_menu(void) {
    printf("\nVirtual Memory Dashboard\n");
    printf("------------------------\n");
    printf("1. System memory\n");
    printf("2. Process memory\n");
    printf("3. Virtual memory mapping\n");
    printf("4. Memory leak analysis\n");
    printf("5. Advanced analytics\n");
    printf("6. Exit\n");
    printf("------------------------\n");
    printf("Enter your choice (1-6): ");
}

int main(void) {
    int choice;
    
    while (1) {
        print_menu();
        if (scanf("%d", &choice) != 1) {
            while (getchar() != '\n'); // Clear input buffer
            printf("Invalid input. Please enter a number.\n");
            continue;
        }

        if (choice == 6) break;

        switch(choice) {
            case 1: analyze_system_memory(); break;
            case 2: analyze_process_memory(); break;
            case 3: display_memory_mapping(); break;
            case 4: test_memory_leaks(); break;
            case 5: 
                analyze_memory_advanced(); // This will exit after printing JSON
                break;
            default:
                printf("Invalid choice\n");
        }
    }

    return 0;
}

void detect_memory_leaks(const char* file_name) {
    pthread_mutex_lock(&g_mutex);
    MemoryBlock* curr = g_memory_block_head;
    int leak_count = 0;
    size_t total_leaked = 0;

    printf("\nChecking for memory leaks...\n");
    printf("-----------------------------\n");

    while (curr != NULL) {
        if (strcmp(curr->file, file_name) == 0) {
            printf("Leak detected: %zu bytes at %s:%d\n", 
                   curr->size, curr->file, curr->line);
            leak_count++;
            total_leaked += curr->size;
        }
        curr = curr->next;
    }

    if (leak_count == 0) {
        printf("No memory leaks detected.\n");
    } else {
        printf("\nSummary:\n");
        printf("- Total leaks found: %d\n", leak_count);
        printf("- Total memory leaked: %zu bytes\n", total_leaked);
    }
    printf("-----------------------------\n");

    pthread_mutex_unlock(&g_mutex);
}

void test_memory_leaks(void) {
    // Allocate some memory
    int* ptr1 = tracked_malloc(sizeof(int) * 100, __FILE__, __LINE__);
    int* ptr2 = tracked_malloc(sizeof(int) * 200, __FILE__, __LINE__);
    
    // Free only one pointer to create a leak
    tracked_free(ptr1);
    // ptr2 is intentionally not freed to demonstrate leak detection
    
    // Check for leaks
    detect_memory_leaks(__FILE__);
}