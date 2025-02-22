import socket


RECEIVER_IP = "192.168.1.8"  # Replace with receiver's local IP
PORT = 5001
FILE_PATH = "example.txt"  # Replace with the actual file to send

def send_file():
    with socket.socket(socket.AF_INET, socket.SOCK_STREAM) as client_socket:
        client_socket.connect((RECEIVER_IP, 5001))
        with open(FILE_PATH, "rb") as f:
            while (data := f.read(1024)):
                client_socket.send(data)


        print("File sent successfully!")

if __name__ == "__main__":
    send_file()
