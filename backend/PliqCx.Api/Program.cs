using Dapper;
using Npgsql;
using PliqCx.Api.Features.Analytics;
using PliqCx.Api.Features.Contacts;

var builder = WebApplication.CreateBuilder(args);

DefaultTypeMap.MatchNamesWithUnderscores = true;

var connectionString = builder.Configuration.GetConnectionString("Postgres")
    ?? throw new InvalidOperationException("ConnectionStrings:Postgres não configurada.");
builder.Services.AddSingleton(NpgsqlDataSource.Create(connectionString));

builder.Services.AddProblemDetails();

const string frontendCors = "frontend";
builder.Services.AddCors(options => options.AddPolicy(frontendCors, policy => policy
    .WithOrigins(builder.Configuration.GetValue<string>("Cors:FrontendOrigin") ?? "http://localhost:5173")
    .AllowAnyHeader()
    .AllowAnyMethod()));

builder.Services
    .AddContactsModule()
    .AddAnalyticsModule();

var app = builder.Build();

app.UseExceptionHandler();
app.UseCors(frontendCors);

app.MapContactsEndpoints();
app.MapAnalyticsEndpoints();

app.Run();
