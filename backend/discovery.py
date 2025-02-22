import socket
import threading
import time

DISCOVERY_PORT = 5002
DISCOVERY_MESSAGE = "LAN_FILE_SHARING"

def listen_for_peers():
    """Listen for incoming peer announcements."""
    with socket.socket(socket.AF_INET, socket.SOCK_DGRAM) as sock:
        sock.setsockopt(socket.SOL_SOCKET, socket.SO_BROADCAST, 1)
        sock.bind(("", DISCOVERY_PORT))

        while True:
            data, addr = sock.recvfrom(1024)
            message = data.decode()
            if message == DISCOVERY_MESSAGE:
                print(f"Discovered peer: {addr[0]}")

def announce_self():
    """Broadcast this device's presence."""
    with socket.socket(socket.AF_INET, socket.SOCK_DGRAM) as sock:
        sock.setsockopt(socket.SOL_SOCKET, socket.SO_BROADCAST, 1)

        while True:
            sock.sendto(DISCOVERY_MESSAGE.encode(), ("255.255.255.255", DISCOVERY_PORT))
            time.sleep(5)  # Send presence every 5 seconds

if __name__ == "__main__":
    threading.Thread(target=listen_for_peers, daemon=True).start()
    announce_self()
