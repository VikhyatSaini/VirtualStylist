# Virtual Stylist – Cloud & DevOps Implementation

## Project Overview

Virtual Stylist is an AI-powered fashion recommendation web application developed using Flask and integrated with Google Gemini AI. The application provides personalized styling suggestions, fashion advice, and trend recommendations through an interactive chat-based interface.

This project demonstrates the implementation of modern DevOps practices by deploying the application on AWS cloud infrastructure using Docker, Jenkins, Kubernetes (K3s), Prometheus, and Grafana.

---

## Objectives

* Develop an AI-powered virtual fashion assistant.
* Containerize the application using Docker.
* Automate build and deployment processes using Jenkins.
* Deploy the application using Kubernetes.
* Provision cloud infrastructure using Terraform.
* Monitor system performance using Prometheus and Grafana.
* Implement a complete CI/CD workflow.

---

## Technology Stack

### Application Layer

* Python 3.11
* Flask
* HTML
* CSS
* JavaScript
* Google Gemini AI

### DevOps Tools

* Git & GitHub
* Docker
* Jenkins
* DockerHub
* Kubernetes (K3s)
* Terraform
* Prometheus
* Grafana

### Cloud Platform

* AWS EC2

---

## Project Architecture

GitHub Repository

↓

Jenkins CI/CD Pipeline

↓

Docker Image Build

↓

DockerHub Push

↓

Kubernetes Deployment (K3s)

↓

Virtual Stylist Application

↓

Prometheus Monitoring

↓

Grafana Dashboard

---

## Repository Structure

```text
VirtualStylist/
│
├── app.py
├── models.py
├── requirements.txt
├── Dockerfile
├── Dockerfile.jenkins
├── Jenkinsfile
│
├── static/
├── templates/
│
├── terraform/
│   └── main.tf
│
├── k3s/
│   ├── deployment.yaml
│   └── service.yaml
│
├── monitoring/
│   ├── docker-compose.yml
│   └── prometheus.yml
│
├── documentation/
│   ├── DevOps12322613.pdf
│   └── Virtual_Stylist_DevOps.pptx
│
└── README.md
```

---

## Docker Containerization

Build Docker image:

```bash
docker build -t virtualstylist .
```

Run container:

```bash
docker run -d -p 5000:5000 virtualstylist
```

---

## Jenkins CI/CD Pipeline

The Jenkins pipeline performs:

1. Source Code Checkout
2. Docker Image Build
3. DockerHub Authentication
4. Docker Image Push

Pipeline Stages:

* Build Docker Image
* Push Docker Image

---

## Terraform Infrastructure

Terraform is used to provision AWS infrastructure.

Resources created:

* EC2 Instance
* Security Group
* SSH Key Pair Configuration

Deploy infrastructure:

```bash
terraform init
terraform plan
terraform apply
```

---

## Kubernetes Deployment

Deploy application:

```bash
kubectl apply -f deployment.yaml
kubectl apply -f service.yaml
```

Verify deployment:

```bash
kubectl get pods
kubectl get services
```

---

## Monitoring Setup

### Prometheus

Prometheus collects system metrics from Node Exporter.

Access:

```text
http://<EC2-PUBLIC-IP>:9090
```

### Grafana

Grafana visualizes metrics using dashboards.

Access:

```text
http://<EC2-PUBLIC-IP>:3000
```

Default Dashboard:

* Node Exporter Full (ID: 1860)

---

## Application Deployment

The application is deployed on AWS EC2 using:

* Docker Containerization
* Kubernetes Orchestration
* Jenkins Automation
* Prometheus Monitoring
* Grafana Visualization

Application URL:

```text
http://<EC2-PUBLIC-IP>:30007
```

---

## Features

* User Authentication
* AI-Powered Fashion Recommendations
* Outfit Suggestions
* Fashion Trend Assistance
* Interactive Chat Interface
* Cloud Deployment
* Automated CI/CD Pipeline
* Containerized Architecture
* Infrastructure Monitoring

---

## Monitoring Metrics

The monitoring stack provides visibility into:

* CPU Usage
* Memory Usage
* Disk Utilization
* Network Traffic
* System Uptime
* Container Health

---

## Results

* Successfully containerized the Flask application.
* Automated image build and deployment workflow.
* Deployed application on Kubernetes cluster.
* Provisioned infrastructure using Terraform.
* Implemented monitoring using Prometheus and Grafana.
* Established an end-to-end DevOps pipeline.

---

## Future Enhancements

* Webhook-based automatic deployment.
* Kubernetes Horizontal Pod Autoscaling.
* HTTPS using Nginx and SSL certificates.
* Multi-node Kubernetes cluster.
* Advanced alerting with Prometheus Alertmanager.
* Blue-Green Deployment Strategy.

---

## Author

Vikhyat Saini

Cloud Computing & DevOps Project

Virtual Stylist – End-to-End DevOps Implementation
