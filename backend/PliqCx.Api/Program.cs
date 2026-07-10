using Dapper;
using Microsoft.AspNetCore.Mvc;
using Npgsql;
using PliqCx.Api.Common;
using PliqCx.Api.Repositories;
using PliqCx.Api.Services;

var builder = WebApplication.CreateBuilder(args);

DefaultTypeMap.MatchNamesWithUnderscores = true;

var connectionString = builder.Configuration.GetConnectionString("Postgres")
    ?? throw new InvalidOperationException("ConnectionStrings:Postgres não configurada.");
builder.Services.AddSingleton(NpgsqlDataSource.Create(connectionString));

builder.Services.AddControllers()
    .ConfigureApiBehaviorOptions(options =>
    {
        options.InvalidModelStateResponseFactory = context =>
        {
            var message = context.ModelState
                .SelectMany(entry => entry.Value!.Errors)
                .Select(error => error.ErrorMessage)
                .FirstOrDefault(m => !string.IsNullOrWhiteSpace(m)) ?? "Requisição inválida.";
            return new BadRequestObjectResult(new ErrorResponse(message));
        };
    });

builder.Services.AddProblemDetails();
builder.Services.AddExceptionHandler<AppExceptionHandler>();

const string frontendCors = "frontend";
builder.Services.AddCors(options => options.AddPolicy(frontendCors, policy => policy
    .WithOrigins(builder.Configuration.GetValue<string>("Cors:FrontendOrigin") ?? "http://localhost:5173")
    .AllowAnyHeader()
    .AllowAnyMethod()));

builder.Services.AddScoped<IContactRepository, ContactRepository>();
builder.Services.AddScoped<IContactService, ContactService>();
builder.Services.AddScoped<IAnalyticsRepository, AnalyticsRepository>();
builder.Services.AddScoped<IAnalyticsService, AnalyticsService>();

var app = builder.Build();

app.UseExceptionHandler();
app.UseCors(frontendCors);
app.MapControllers();

app.Run();
