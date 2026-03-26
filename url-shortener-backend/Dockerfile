# Stage 1: Build the application
# Dùng base image có sẵn JDK để chạy Gradle Wrapper thay vì dùng image của Gradle
FROM eclipse-temurin:21-jdk-alpine AS builder
WORKDIR /app

# BƯỚC QUAN TRỌNG NHẤT ĐỂ CACHE: Chỉ copy các file cấu hình Gradle trước
COPY gradlew .
COPY gradle gradle
COPY build.gradle settings.gradle ./

# Cấp quyền thực thi cho gradlew (Rất cần thiết nếu bạn đang code trên Windows)
RUN chmod +x ./gradlew

# Tải trước tất cả các thư viện (Dependencies)
# Lớp (layer) này sẽ được Docker giữ lại trong bộ nhớ đệm (cache)
RUN ./gradlew dependencies --no-daemon

# SAU ĐÓ mới copy source code vào
COPY src src

# Tiến hành build code (Lúc này thư viện đã có sẵn, chỉ tốn vài giây để build code của bạn)
RUN ./gradlew build -x test --no-daemon

# Stage 2: Run the application
FROM eclipse-temurin:21-jre-alpine
WORKDIR /app

# Add non-root user for security
RUN addgroup -S spring && adduser -S spring -G spring

# Create logs directory and assign permissions
RUN mkdir logs && chown -R spring:spring /app/logs

USER spring:spring

COPY --from=builder /app/build/libs/*-SNAPSHOT.jar app.jar

EXPOSE 8080

ENTRYPOINT ["java", "-jar", "app.jar"]