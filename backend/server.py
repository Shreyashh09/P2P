import os
import json
import socket
import threading
import time
import requests
from flask import Flask, request, jsonify

app = Flask(__name__)

# Get local IP
def get_local_ip():
    s = socket.socket(socket.AF_INET, socket.SOCK_DGRAM)
    s.connect(("8.8.8.8", 80))  # Google DNS
    ip = s.getsockname()[0]
    s.close()
    return ip

LOCAL_IP = get_local_ip()
SUBNET = ".".join(LOCAL_IP.split(".")[:-1])  # Extract 192.168.1
peers = []

# Discover peers on LAN
def discover_peers():
    global peers
    peers = []
    for i in range(1, 255):
        ip = f"{SUBNET}.{i}"
        response = os.system(f"ping -c 1 -W 1 {ip} > /dev/null 2>&1")
        if response == 0:  # Device is reachable
            peers.append(ip)
    print("Discovered peers:", peers)

# Background thread for discovery
def start_discovery():
    while True:
        discover_peers()
        time.sleep(10)

# API: Get list of discovered peers
@app.route("/peers", methods=["GET"])
def get_peers():
    return jsonify(peers)

# API: Send a file to a selected peer
@app.route("/send", methods=["POST"])
def send_file():
    if "file" not in request.files or "receiver_ip" not in request.form:
        return jsonify({"error": "Missing file or receiver IP"}), 400

    file = request.files["file"]
    receiver_ip = request.form["receiver_ip"]

    # Forward file to selected peer
    files = {"file": (file.filename, file.stream, file.content_type)}
    try:
        response = requests.post(f"http://{receiver_ip}:5000/receive", files=files)
        return response.json(), response.status_code
    except requests.exceptions.RequestException as e:
        return jsonify({"error": str(e)}), 500

# API: Receive a file (this runs on the receiver's machine)
@app.route("/receive", methods=["POST"])
def receive_file():
    if "file" not in request.files:
        return jsonify({"error": "No file received"}), 400

    file = request.files["file"]
    save_dir = "uploads"
    os.makedirs(save_dir, exist_ok=True)
    save_path = os.path.join(save_dir, file.filename)
    file.save(save_path)

    return jsonify({"message": f"File {file.filename} received successfully!"})

# Start peer discovery in the background
threading.Thread(target=start_discovery, daemon=True).start()

if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5000)
