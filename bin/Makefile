CC = gcc
CFLAGS = -Wall -Wextra -g
LDFLAGS = -pthread -ljson-c -lm

TARGET = vmd
SRC = memoryanalysis.c

all: $(TARGET)

$(TARGET): $(SRC)
	$(CC) $(CFLAGS) $^ -o $@ $(LDFLAGS)

clean:
	rm -f $(TARGET)

.PHONY: all clean 