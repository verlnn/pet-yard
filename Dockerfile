FROM eclipse-temurin:25-jre

WORKDIR /app

COPY build/libs/petYard.jar petYard.jar

EXPOSE 8080

ENTRYPOINT ["java", "-jar", "/app/petYard.jar"]
