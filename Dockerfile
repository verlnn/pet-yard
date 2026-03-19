#FROM eclipse-temurin:25-jre
#
#WORKDIR /app
#
#COPY build/libs/petYard.jar petYard.jar
#
#EXPOSE 8080
#
#ENTRYPOINT ["java", "-jar", "/app/petYard.jar"]
#



# =========================
# 1) Build stage
# =========================
FROM gradle:8.10.2-jdk25 AS builder

WORKDIR /app

COPY gradlew gradlew
COPY gradle gradle
COPY build.gradle settings.gradle ./
COPY src src

RUN chmod +x ./gradlew
RUN ./gradlew clean build -x test --no-daemon

# =========================
# 2) Runtime stage
# =========================
FROM eclipse-temurin:25-jre

WORKDIR /app

COPY --from=builder /app/build/libs/*.jar app.jar

EXPOSE 8080

ENTRYPOINT ["java", "-jar", "/app/app.jar"]