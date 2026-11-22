FROM maven:3.9.6-eclipse-temurin-21 AS build
WORKDIR /app
COPY book-network/pom.xml .
COPY book-network/src ./src
RUN mvn clean package -DskipTests

FROM eclipse-temurin:21-jre-alpine
WORKDIR /app
COPY --from=build /app/target/*.jar app.jar
EXPOSE 8088
ENTRYPOINT ["java", "-Xmx384m", "-jar", "app.jar"]