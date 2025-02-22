import socket


HOST = "0.0.0.0"  # Accept connections from any device in LAN
PORT = 5001       # Choose any available port

def receive_file():
    with socket.socket(socket.AF_INET, socket.SOCK_STREAM) as server_socket:
        server_socket.bind((HOST, PORT))
        server_socket.listen(1)
        print(f"Waiting for file transfer on {HOST}:{PORT}...")

        conn, addr = server_socket.accept()
        print(f"Connected to {addr}")

        with open("received_file", "wb") as f:
            while True:
                data = conn.recv(1024)
                if not data:
                    break
                f.write(data)

        print("File received successfully!")

if __name__ == "__main__":
    receive_file()
