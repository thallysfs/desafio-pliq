using Dapper;
using Npgsql;
using PliqCx.Api.Features.Analytics;
using PliqCx.Api.Features.Contacts;

var builder = WebApplication.CreateBuilder(args);

// Dapper mapeia colunas snake_case (survey_id) para propriedades PascalCase (SurveyId).
DefaultTypeMap.MatchNamesWithUnderscores = true;

var connectionString = builder.Configuration.GetConnectionString("Postgres")
    ?? throw new InvalidOperationException("ConnectionStrings:Postgres não configurada.");
builder.Services.AddSingleton(NpgsqlDataSource.Create(connectionString));

builder.Services.AddProblemDetails();

// CORS para o dev server do front (Vite). Origem configurável via Cors:FrontendOrigin.
const string frontendCors = "frontend";
builder.Services.AddCors(options => options.AddPolicy(frontendCors, policy => policy
    .WithOrigins(builder.Configuration.GetValue<string>("Cors:FrontendOrigin") ?? "http://localhost:5173")
    .AllowAnyHeader()
    .AllowAnyMethod()));

builder.Services
    .AddContactsModule()
    .AddAnalyticsModule();

var app = builder.Build();

app.UseExceptionHandler();       // erros não tratados -> problem+json 500 (nunca vaza stacktrace)
app.UseCors(frontendCors);

app.MapContactsEndpoints();
app.MapAnalyticsEndpoints();

app.Run();
