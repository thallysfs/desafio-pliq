# build
FROM mcr.microsoft.com/dotnet/sdk:10.0 AS build
WORKDIR /src

COPY PliqCx.Api/PliqCx.Api.csproj PliqCx.Api/
RUN dotnet restore PliqCx.Api/PliqCx.Api.csproj

COPY PliqCx.Api/ PliqCx.Api/
RUN dotnet publish PliqCx.Api/PliqCx.Api.csproj -c Release -o /app/publish /p:UseAppHost=false

# runtime
FROM mcr.microsoft.com/dotnet/aspnet:10.0 AS runtime
WORKDIR /app
COPY --from=build /app/publish .
EXPOSE 8080
ENTRYPOINT ["dotnet", "PliqCx.Api.dll"]
