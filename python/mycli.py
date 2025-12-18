import sys
import time

def main():
    # Prosty przykład: pierwszy argument jako "komenda"
    cmd = sys.argv[1] if len(sys.argv) > 1 else "default"

    # Udajemy pracę
    time.sleep(0.2)

    # Zwracamy output na stdout (to przechwyci Electron)
    print(f"Python says: hello! cmd={cmd}")

if __name__ == "__main__":
    main()
