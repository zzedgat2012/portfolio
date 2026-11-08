---
title: The simplest example is kafka + golang
summary: This article presents a simple way to implement a microservice architecture using Kafka, Golang and Docker.
publishedOn: 2024-01-15
tags:
  - docker
  - golang
  - kafka
  - microservices
legacyWpId: 12
---
## Introduction

In this article, we'll explore how to set up a simple but production-ready microservice architecture using Kafka, Golang, and Docker. This setup has been battle-tested in production environments and serves as an excellent starting point for building scalable systems.

## Why This Stack?

### Golang

- Excellent performance and low memory footprint
- Built-in concurrency support with goroutines
- Fast compilation and execution
- Strong standard library

### Kafka

- High-throughput message broker
- Fault-tolerant and scalable
- Perfect for event-driven architectures
- Great for microservices communication

### Docker

- Consistent development and production environments
- Easy deployment and scaling
- Isolation and resource management

## Architecture Overview

Our architecture consists of three main components:

1\. **Producer Service** – Generates events and sends them to Kafka

2\. **Kafka Cluster** – Message broker that handles event distribution

3\. **Consumer Service** – Processes events from Kafka topics

## Implementation

### Setting Up Kafka with Docker

First, let's create a docker-compose.yml file to set up Kafka:

```yaml
version: '3'
services:
  zookeeper:
    image: confluentinc/cp-zookeeper:latest
    environment:
      ZOOKEEPER_CLIENT_PORT: 2181
  
  kafka:
    image: confluentinc/cp-kafka:latest
    depends_on:
      - zookeeper
    environment:
      KAFKA_ZOOKEEPER_CONNECT: zookeeper:2181
      KAFKA_ADVERTISED_LISTENERS: PLAINTEXT://kafka:9092
```

### Producer Service in Golang

Here's a simple producer implementation:

```go
package main

import (
    "github.com/confluentinc/confluent-kafka-go/kafka"
    "log"
)

func main() {
    p, err := kafka.NewProducer(&kafka.ConfigMap{
        "bootstrap.servers": "localhost:9092",
    })
    
    if err != nil {
        log.Fatal(err)
    }
    
    defer p.Close()
    
    // Send message
    topic := "events"
    p.Produce(&kafka.Message{
        TopicPartition: kafka.TopicPartition{
            Topic: &topic,
            Partition: kafka.PartitionAny,
        },
        Value: []byte("Hello Kafka!"),
    }, nil)
}
```

## Best Practices

1\. **Error Handling** – Always implement proper error handling and retry logic

2\. **Monitoring** – Use tools like Prometheus to monitor Kafka metrics

3\. **Schema Management** – Consider using Avro or Protocol Buffers for message schemas

4\. **Testing** – Write integration tests using test containers

## Conclusion

This setup provides a solid foundation for building microservices with Kafka and Golang. The combination offers high performance, scalability, and maintainability for production systems.

Feel free to extend this architecture based on your specific needs!
