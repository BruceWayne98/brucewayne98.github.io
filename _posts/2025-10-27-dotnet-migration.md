---
title: "Migrating Azure Functions from .NET 6 In-Process to .NET 8 Isolated Worker Model"
excerpt: "A comprehensive technical guide for migrating Azure Functions from the in-process model to the isolated worker model, covering project structure changes, dependency injection, binding updates, middleware implementation, and deployment strategies."
categories:
  - Azure
  - Serverless Computing
tags:
  - Azure Functions
  - .NET 8
  - Isolated Worker Model
  - Migration Guide
  - Serverless
  - Dependency Injection
  - ASP.NET Core Integration
toc: true
toc_label: "Table of Contents"
toc_icon: "cog"
author_profile: true
---

## Overview

This comprehensive guide walks you through migrating Azure Functions from **.NET 6 in-process model** to **.NET 8 isolated worker model**. This migration is critical as **support for the in-process model ends on November 10, 2026**, making it imperative for production systems to transition to the isolated worker model.

**Key Benefits of Migration:**
- **Flexibility**: Run any .NET version (LTS, STS, or .NET Framework 4.8)
- **Isolation**: Function execution separate from Azure Functions runtime
- **Modern Features**: Middleware pipeline, improved dependency injection
- **Performance**: ASP.NET Core integration for HTTP triggers
- **Future-Proof**: Continued support beyond 2026

**Migration Timeline:**
- **Deadline**: November 10, 2026 (in-process model end of support)
- **Recommended**: Migrate as soon as possible to .NET 8 isolated
- **Testing Required**: Extensive testing in staging environment

---

## Understanding the Execution Models

### In-Process Model (Legacy)

**Architecture**:
```
┌─────────────────────────────────────────┐
│   Azure Functions Host Process          │
│  ┌────────────────────────────────────┐ │
│  │   Your Function Code (same process)│ │
│  │   • Tightly coupled to runtime     │ │
│  │   • Shares AppDomain with host     │ │
│  └────────────────────────────────────┘ │
└─────────────────────────────────────────┘
```

**Characteristics**:
- Functions run **in the same process** as the Functions host
- **Tight coupling** between function code and runtime
- Limited to **LTS versions** of .NET only
- Uses `Microsoft.NET.Sdk.Functions` SDK
- `FunctionName` attribute for function definition
- Limited dependency injection capabilities

**Limitations**:
- **Version constraints**: Cannot use non-LTS .NET versions
- **No middleware**: Cannot inject custom middleware into pipeline
- **Testing complexity**: Difficult to isolate for unit testing
- **Dependency conflicts**: Runtime version conflicts possible
- **End of support**: November 10, 2026

### Isolated Worker Model (Modern)

**Architecture**:
```
┌──────────────────────────┐    IPC/gRPC    ┌─────────────────────┐
│  Azure Functions Host    │ ◄─────────────► │ Worker Process      │
│  • Manages triggers      │                 │ • Your function code│
│  • Handles scaling       │                 │ • Full control      │
│  • Bindings metadata     │                 │ • Middleware        │
└──────────────────────────┘                 └─────────────────────┘
```

**Characteristics**:
- Functions run in **separate worker process**
- **Decoupled** from Azure Functions runtime
- Supports **all .NET versions** (LTS, STS, .NET Framework)
- Uses `Microsoft.Azure.Functions.Worker` SDK
- `Function` attribute for function definition
- Full ASP.NET Core-style dependency injection

**Benefits**:
- **Version flexibility**: .NET 6, 7, 8, 9, 10 (preview), .NET Framework 4.8
- **Middleware support**: Custom middleware pipeline
- **Better testability**: Easily mock dependencies
- **Process isolation**: Crash in one function doesn't affect others
- **Long-term support**: Microsoft's recommended model
- **Performance**: ASP.NET Core integration for HTTP triggers

---

## Execution Model Comparison

### Feature Comparison Table

| Feature | In-Process Model | Isolated Worker Model |
|---------|------------------|----------------------|
| **Supported .NET Versions** | LTS only (.NET 6, .NET 8) | LTS, STS, .NET Framework |
| **Current Support** | Ends Nov 10, 2026 | ✅ Full support |
| **Core Package** | `Microsoft.NET.Sdk.Functions` | `Microsoft.Azure.Functions.Worker` |
| **Binding Extensions** | `Microsoft.Azure.WebJobs.Extensions.*` | `Microsoft.Azure.Functions.Worker.Extensions.*` |
| **Function Attribute** | `[FunctionName]` | `[Function]` |
| **Dependency Injection** | Limited (via `Startup.cs`) | Full ASP.NET Core DI |
| **Middleware** | ❌ Not supported | ✅ Supported |
| **Logging** | `ILogger` parameter | `ILogger<T>` via DI |
| **HTTP Model** | `HttpRequest`/`IActionResult` | `HttpRequest`/`IActionResult` (ASP.NET Core)<br>or `HttpRequestData`/`HttpResponseData` |
| **Output Bindings** | `out` parameters, `IAsyncCollector` | Return values, arrays |
| **Imperative Bindings** | `IBinder` | Use SDK clients directly |
| **Cold Start** | Optimized | Configurable optimizations |
| **Flex Consumption** | ❌ Not supported | ✅ Supported |

---

## Prerequisites and Preparation

### System Requirements

**Development Environment**:
- **Visual Studio 2022** (17.8 or later) or **Visual Studio Code**
- **Azure Functions Core Tools** v4.x (for local testing)
- **.NET 8 SDK** ([Download](https://dotnet.microsoft.com/download/dotnet/8.0))
- **Azure subscription** (for deployment)

**Recommended Tools**:
- **.NET Upgrade Assistant**: Automates many migration steps
  ```bash
  dotnet tool install -g upgrade-assistant
  ```
- **PowerShell 7**: For migration scripts
- **Git**: For version control during migration

### Identify Functions to Migrate

Use this PowerShell script to list all in-process Azure Functions in your subscription:

```powershell
# Set your subscription
Set-AzContext -Subscription '<YOUR SUBSCRIPTION ID>'

# Get all function apps using in-process model
$FunctionApps = Get-AzFunctionApp
$AppInfo = @{}

foreach ($App in $FunctionApps) {
    if ($App.Runtime -eq 'dotnet') {
        $AppInfo.Add($App.Name, $App.Runtime)
    }
}

# Display results
$AppInfo
```

**Output**: List of function apps that need migration.

### Migration Checklist

**Before Starting**:
- ✅ Review all function code and dependencies
- ✅ Document current configurations (`host.json`, `local.settings.json`)
- ✅ Create backup/branch in source control
- ✅ Set up staging slot for testing
- ✅ Review breaking changes in binding extensions
- ✅ Plan downtime window (if needed)

**Testing Strategy**:
- ✅ Unit tests for all functions
- ✅ Integration tests with actual Azure services
- ✅ Load testing in staging environment
- ✅ Monitor Application Insights for errors

---

## Step-by-Step Migration Guide

### Step 1: Update Project File (.csproj)

#### Original In-Process Project File

```xml
<Project Sdk="Microsoft.NET.Sdk">
  <PropertyGroup>
    <TargetFramework>net6.0</TargetFramework>
    <AzureFunctionsVersion>v4</AzureFunctionsVersion>
    <RootNamespace>My.Namespace</RootNamespace>
  </PropertyGroup>
  <ItemGroup>
    <PackageReference Include="Microsoft.NET.Sdk.Functions" Version="4.1.1" />
  </ItemGroup>
  <ItemGroup>
    <None Update="host.json">
      <CopyToOutputDirectory>PreserveNewest</CopyToOutputDirectory>
    </None>
    <None Update="local.settings.json">
      <CopyToOutputDirectory>PreserveNewest</CopyToOutputDirectory>
      <CopyToPublishDirectory>Never</CopyToPublishDirectory>
    </None>
  </ItemGroup>
</Project>
```

#### Updated Isolated Worker Project File (.NET 8)

```xml
<Project Sdk="Microsoft.NET.Sdk">
  <PropertyGroup>
    <TargetFramework>net8.0</TargetFramework>
    <AzureFunctionsVersion>v4</AzureFunctionsVersion>
    <RootNamespace>My.Namespace</RootNamespace>
    <OutputType>Exe</OutputType>
    <ImplicitUsings>enable</ImplicitUsings>
    <Nullable>enable</Nullable>
  </PropertyGroup>
  
  <ItemGroup>
    <!-- ASP.NET Core Integration (recommended for best performance) -->
    <FrameworkReference Include="Microsoft.AspNetCore.App" />
    
    <!-- Core Isolated Worker Packages -->
    <PackageReference Include="Microsoft.Azure.Functions.Worker" Version="1.21.0" />
    <PackageReference Include="Microsoft.Azure.Functions.Worker.Sdk" Version="1.17.2" />
    
    <!-- ASP.NET Core Integration for HTTP Triggers -->
    <PackageReference Include="Microsoft.Azure.Functions.Worker.Extensions.Http.AspNetCore" Version="1.2.1" />
    
    <!-- Application Insights Integration -->
    <PackageReference Include="Microsoft.ApplicationInsights.WorkerService" Version="2.22.0" />
    <PackageReference Include="Microsoft.Azure.Functions.Worker.ApplicationInsights" Version="1.2.0" />
  </ItemGroup>
  
  <ItemGroup>
    <None Update="host.json">
      <CopyToOutputDirectory>PreserveNewest</CopyToOutputDirectory>
    </None>
    <None Update="local.settings.json">
      <CopyToOutputDirectory>PreserveNewest</CopyToOutputDirectory>
      <CopyToPublishDirectory>Never</CopyToPublishDirectory>
    </None>
  </ItemGroup>
  
  <!-- ExecutionContext alias to avoid conflicts -->
  <ItemGroup>
    <Using Include="System.Threading.ExecutionContext" Alias="ExecutionContext"/>
  </ItemGroup>
</Project>
```

**Key Changes**:
1. **Target Framework**: `net6.0` → `net8.0`
2. **Output Type**: Added `<OutputType>Exe</OutputType>` (isolated runs as executable)
3. **Package Replacement**:
   - Remove: `Microsoft.NET.Sdk.Functions`
   - Add: `Microsoft.Azure.Functions.Worker` suite
4. **ASP.NET Core Integration**: `FrameworkReference` for best performance
5. **Optional Modern Features**: `ImplicitUsings`, `Nullable`

### Step 2: Package Migration

Replace all in-process binding packages with isolated worker equivalents:

#### Common Package Migrations

| In-Process Package | Isolated Worker Package | Purpose |
|-------------------|------------------------|---------|
| `Microsoft.NET.Sdk.Functions` | `Microsoft.Azure.Functions.Worker` + `Microsoft.Azure.Functions.Worker.Sdk` | Core SDK |
| `Microsoft.Azure.WebJobs.Extensions.Storage` | `Microsoft.Azure.Functions.Worker.Extensions.Storage.*` | Storage bindings |
| `Microsoft.Azure.WebJobs.Extensions.CosmosDB` | `Microsoft.Azure.Functions.Worker.Extensions.CosmosDB` | Cosmos DB |
| `Microsoft.Azure.WebJobs.Extensions.ServiceBus` | `Microsoft.Azure.Functions.Worker.Extensions.ServiceBus` | Service Bus |
| `Microsoft.Azure.WebJobs.Extensions.EventHubs` | `Microsoft.Azure.Functions.Worker.Extensions.EventHubs` | Event Hubs |
| `Microsoft.Azure.WebJobs.Extensions.EventGrid` | `Microsoft.Azure.Functions.Worker.Extensions.EventGrid` | Event Grid |
| `Microsoft.Azure.WebJobs.Extensions.SignalRService` | `Microsoft.Azure.Functions.Worker.Extensions.SignalRService` | SignalR |
| `Microsoft.Azure.WebJobs.Extensions.DurableTask` | `Microsoft.Azure.Functions.Worker.Extensions.DurableTask` | Durable Functions |
| `Microsoft.Azure.Functions.Extensions` | ❌ Remove (built-in DI) | Dependency injection |

#### Detailed Package Replacement

**Timer Trigger**:
```xml
<!-- Add this -->
<PackageReference Include="Microsoft.Azure.Functions.Worker.Extensions.Timer" Version="4.3.1" />
```

**Blob Storage**:
```xml
<!-- Remove -->
<PackageReference Include="Microsoft.Azure.WebJobs.Extensions.Storage.Blobs" Version="..." />

<!-- Add -->
<PackageReference Include="Microsoft.Azure.Functions.Worker.Extensions.Storage.Blobs" Version="6.3.0" />
```

**Queue Storage**:
```xml
<!-- Remove -->
<PackageReference Include="Microsoft.Azure.WebJobs.Extensions.Storage.Queues" Version="..." />

<!-- Add -->
<PackageReference Include="Microsoft.Azure.Functions.Worker.Extensions.Storage.Queues" Version="5.5.0" />
```

**Table Storage**:
```xml
<!-- Remove -->
<PackageReference Include="Microsoft.Azure.WebJobs.Extensions.Tables" Version="..." />

<!-- Add -->
<PackageReference Include="Microsoft.Azure.Functions.Worker.Extensions.Tables" Version="1.2.0" />
```

**Cosmos DB**:
```xml
<!-- Remove -->
<PackageReference Include="Microsoft.Azure.WebJobs.Extensions.CosmosDB" Version="..." />

<!-- Add -->
<PackageReference Include="Microsoft.Azure.Functions.Worker.Extensions.CosmosDB" Version="4.8.0" />
```

**Service Bus**:
```xml
<!-- Remove -->
<PackageReference Include="Microsoft.Azure.WebJobs.Extensions.ServiceBus" Version="..." />

<!-- Add -->
<PackageReference Include="Microsoft.Azure.Functions.Worker.Extensions.ServiceBus" Version="5.16.0" />
```

**Important**: Remove all packages in `Microsoft.Azure.WebJobs.*` and `Microsoft.Azure.Functions.Extensions` namespaces.

### Step 3: Create Program.cs File

The isolated worker model requires a `Program.cs` file to bootstrap the application (replaces `Startup.cs`).

#### Basic Program.cs (with ASP.NET Core Integration)

```csharp
using Microsoft.Azure.Functions.Worker;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Hosting;

var host = new HostBuilder()
    .ConfigureFunctionsWebApplication()  // ASP.NET Core integration
    .ConfigureServices(services => {
        // Application Insights
        services.AddApplicationInsightsTelemetryWorkerService();
        services.ConfigureFunctionsApplicationInsights();
        
        // Your dependency injection here
        // services.AddSingleton<IMyService, MyService>();
    })
    .Build();

host.Run();
```

#### Advanced Program.cs (with Custom Configuration)

```csharp
using Microsoft.Azure.Functions.Worker;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Hosting;
using Microsoft.Extensions.Logging;

var host = new HostBuilder()
    .ConfigureFunctionsWebApplication()
    .ConfigureAppConfiguration((context, config) =>
    {
        // Add custom configuration sources
        config.AddJsonFile("appsettings.json", optional: true, reloadOnChange: true)
              .AddJsonFile($"appsettings.{context.HostingEnvironment.EnvironmentName}.json", 
                          optional: true, reloadOnChange: true)
              .AddEnvironmentVariables();
    })
    .ConfigureServices((context, services) =>
    {
        // Application Insights
        services.AddApplicationInsightsTelemetryWorkerService();
        services.ConfigureFunctionsApplicationInsights();
        
        // Dependency Injection
        services.AddSingleton<IMyDependency, MyDependency>();
        services.AddScoped<IMyService, MyService>();
        services.AddTransient<IMyRepository, MyRepository>();
        
        // HTTP Client Factory
        services.AddHttpClient();
        services.AddHttpClient<IMyApiClient, MyApiClient>(client =>
        {
            client.BaseAddress = new Uri(context.Configuration["MyApiBaseUrl"]);
        });
        
        // Cosmos DB Client (example)
        services.AddSingleton(sp =>
        {
            var connectionString = context.Configuration["CosmosDbConnectionString"];
            return new CosmosClient(connectionString);
        });
    })
    .ConfigureLogging((context, logging) =>
    {
        // Configure logging levels
        logging.AddFilter("Microsoft.Azure.Functions.Worker", LogLevel.Information);
        logging.AddFilter("My.Namespace", LogLevel.Debug);
    })
    .Build();

host.Run();
```

#### Program.cs Without ASP.NET Core Integration

If you **don't use HTTP triggers**, you can use `ConfigureFunctionsWorkerDefaults`:

```csharp
using Microsoft.Extensions.Hosting;
using Microsoft.Azure.Functions.Worker;

namespace Company.FunctionApp
{
    internal class Program
    {
        static void Main(string[] args)
        {
            var host = new HostBuilder()
                .ConfigureFunctionsWorkerDefaults()  // Without ASP.NET Core
                .ConfigureServices(services => {
                    services.AddApplicationInsightsTelemetryWorkerService();
                    services.ConfigureFunctionsApplicationInsights();
                })
                .Build();
            
            host.Run();
        }
    }
}
```

**Recommendation**: Even for non-HTTP functions, keep ASP.NET Core integration for better performance.

### Step 4: Migrate Startup.cs to Program.cs

If you have a `Startup.cs` file with `FunctionsStartup` attribute, migrate it to `Program.cs`.

#### Original Startup.cs (In-Process)

```csharp
using Microsoft.Azure.Functions.Extensions.DependencyInjection;
using Microsoft.Extensions.DependencyInjection;

[assembly: FunctionsStartup(typeof(MyNamespace.Startup))]

namespace MyNamespace
{
    public class Startup : FunctionsStartup
    {
        public override void Configure(IFunctionsHostBuilder builder)
        {
            builder.Services.AddSingleton<IMyService, MyService>();
            builder.Services.AddHttpClient();
            
            // Custom configuration
            var config = builder.GetContext().Configuration;
            builder.Services.Configure<MyOptions>(config.GetSection("MyOptions"));
        }
        
        public override void ConfigureAppConfiguration(IFunctionsConfigurationBuilder builder)
        {
            builder.ConfigurationBuilder.AddJsonFile("appsettings.json", optional: true);
        }
    }
}
```

#### Migrated to Program.cs (Isolated)

```csharp
using Microsoft.Azure.Functions.Worker;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Hosting;

var host = new HostBuilder()
    .ConfigureFunctionsWebApplication()
    .ConfigureAppConfiguration((context, config) =>
    {
        // Replaces ConfigureAppConfiguration
        config.AddJsonFile("appsettings.json", optional: true, reloadOnChange: true);
    })
    .ConfigureServices((context, services) =>
    {
        // Application Insights
        services.AddApplicationInsightsTelemetryWorkerService();
        services.ConfigureFunctionsApplicationInsights();
        
        // Replaces Configure method
        services.AddSingleton<IMyService, MyService>();
        services.AddHttpClient();
        
        // Custom configuration binding
        services.Configure<MyOptions>(context.Configuration.GetSection("MyOptions"));
    })
    .Build();

host.Run();
```

**After migration, delete `Startup.cs` and remove any `FunctionsStartup` attributes.**

### Step 5: Update Function Signatures

#### Attribute Changes

**In-Process**:
```csharp
[FunctionName("MyFunction")]
```

**Isolated**:
```csharp
[Function("MyFunction")]
```

**Migration**: Perform find-and-replace across project:
- Replace `FunctionName` → `Function`

#### Logging Changes

**In-Process** (method parameter):
```csharp
public static IActionResult Run(
    [HttpTrigger(AuthorizationLevel.Function, "get")] HttpRequest req,
    ILogger log)  // ❌ Parameter-based logging
{
    log.LogInformation("Processing request");
    return new OkResult();
}
```

**Isolated** (dependency injection):
```csharp
public class MyFunction
{
    private readonly ILogger<MyFunction> _logger;
    
    public MyFunction(ILogger<MyFunction> logger)
    {
        _logger = logger;
    }
    
    [Function("MyFunction")]
    public IActionResult Run(
        [HttpTrigger(AuthorizationLevel.Function, "get")] HttpRequest req)
    {
        _logger.LogInformation("Processing request");
        return new OkResult();
    }
}
```

**Migration Steps**:
1. Add private `ILogger<T>` field to function class
2. Create constructor accepting `ILogger<T>`
3. Replace `log` parameter references with `_logger`
4. Remove `ILogger log` from method signature

#### Binding Attribute Changes

**General Pattern**:
- **Triggers**: Usually keep same name (e.g., `QueueTrigger`, `BlobTrigger`)
- **Input Bindings**: Add `Input` suffix (e.g., `Blob` → `BlobInput`, `CosmosDB` → `CosmosDBInput`)
- **Output Bindings**: Add `Output` suffix (e.g., `Queue` → `QueueOutput`, `Blob` → `BlobOutput`)

**Examples**:

| In-Process | Isolated Worker |
|-----------|-----------------|
| `[Queue(...)]` (output) | `[QueueOutput(...)]` |
| `[Blob(...)]` (input) | `[BlobInput(...)]` |
| `[Blob(...)]` (output) | `[BlobOutput(...)]` |
| `[CosmosDB(...)]` (input) | `[CosmosDBInput(...)]` |
| `[CosmosDB(...)]` (output) | `[CosmosDBOutput(...)]` |
| `[Table(...)]` (input) | `[TableInput(...)]` |
| `[Table(...)]` (output) | `[TableOutput(...)]` |

#### Output Binding Changes

**In-Process** (using `out` parameters):
```csharp
[FunctionName("ProcessOrder")]
public static async Task Run(
    [QueueTrigger("orders")] string order,
    [Queue("processed-orders")] out string outputMessage,
    ILogger log)
{
    // Process order
    outputMessage = $"Processed: {order}";
}
```

**Isolated** (using return values):

**Single Output**:
```csharp
[Function("ProcessOrder")]
[QueueOutput("processed-orders")]
public string Run(
    [QueueTrigger("orders")] string order)
{
    _logger.LogInformation("Processing order: {order}", order);
    return $"Processed: {order}";
}
```

**Multiple Outputs**:
```csharp
public class ProcessOrderOutput
{
    [QueueOutput("processed-orders")]
    public string ProcessedMessage { get; set; }
    
    [QueueOutput("audit-queue")]
    public string AuditMessage { get; set; }
}

[Function("ProcessOrder")]
public ProcessOrderOutput Run(
    [QueueTrigger("orders")] string order)
{
    return new ProcessOrderOutput
    {
        ProcessedMessage = $"Processed: {order}",
        AuditMessage = $"Audit: {DateTime.UtcNow} - {order}"
    };
}
```

**Array Outputs** (replacing `IAsyncCollector<T>`):
```csharp
[Function("BatchProcess")]
[QueueOutput("output-queue")]
public string[] Run(
    [QueueTrigger("input-queue")] string[] messages)
{
    return messages.Select(m => $"Processed: {m}").ToArray();
}
```

#### Remove Imperative Bindings

**In-Process** (using `IBinder`):
```csharp
public static async Task Run(
    [QueueTrigger("myqueue")] string message,
    IBinder binder,
    ILogger log)
{
    var blobAttribute = new BlobAttribute($"container/{message}.txt", FileAccess.Write);
    using var writer = await binder.BindAsync<TextWriter>(blobAttribute);
    await writer.WriteAsync("Hello");
}
```

**Isolated** (use SDK clients directly):
```csharp
public class MyFunction
{
    private readonly BlobServiceClient _blobServiceClient;
    
    public MyFunction(BlobServiceClient blobServiceClient)
    {
        _blobServiceClient = blobServiceClient;
    }
    
    [Function("MyFunction")]
    public async Task Run([QueueTrigger("myqueue")] string message)
    {
        var containerClient = _blobServiceClient.GetBlobContainerClient("container");
        var blobClient = containerClient.GetBlobClient($"{message}.txt");
        await blobClient.UploadAsync(new BinaryData("Hello"));
    }
}
```

### Step 6: Migrate HTTP Triggers

HTTP triggers have two options in isolated model: **ASP.NET Core integration** (recommended) or **HttpRequestData/HttpResponseData**.

#### Option 1: ASP.NET Core Integration (Recommended)

**In-Process**:
```csharp
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Azure.WebJobs;
using Microsoft.Azure.WebJobs.Extensions.Http;
using Microsoft.Extensions.Logging;

namespace Company.Function
{
    public static class HttpTriggerCSharp
    {
        [FunctionName("HttpTriggerCSharp")]
        public static IActionResult Run(
            [HttpTrigger(AuthorizationLevel.Function, "get", "post", Route = null)] HttpRequest req,
            ILogger log)
        {
            log.LogInformation("C# HTTP trigger function processed a request.");
            
            string name = req.Query["name"];
            return new OkObjectResult($"Welcome to Azure Functions, {name}!");
        }
    }
}
```

**Isolated with ASP.NET Core**:
```csharp
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Azure.Functions.Worker;
using Microsoft.Extensions.Logging;

namespace Company.Function
{
    public class HttpTriggerCSharp
    {
        private readonly ILogger<HttpTriggerCSharp> _logger;
        
        public HttpTriggerCSharp(ILogger<HttpTriggerCSharp> logger)
        {
            _logger = logger;
        }
        
        [Function("HttpTriggerCSharp")]
        public IActionResult Run(
            [HttpTrigger(AuthorizationLevel.Function, "get", "post")] HttpRequest req)
        {
            _logger.LogInformation("C# HTTP trigger function processed a request.");
            
            string name = req.Query["name"];
            return new OkObjectResult($"Welcome to Azure Functions, {name}!");
        }
    }
}
```

**Key Changes**:
1. Add constructor with `ILogger<T>` injection
2. Change `[FunctionName]` → `[Function]`
3. Remove `Route = null` (handled differently)
4. Change from static to instance class

**Benefits**:
- Familiar ASP.NET Core types (`HttpRequest`, `IActionResult`)
- Model binding support
- Better performance
- Middleware support

#### Option 2: HttpRequestData/HttpResponseData

```csharp
using Microsoft.Azure.Functions.Worker;
using Microsoft.Azure.Functions.Worker.Http;
using Microsoft.Extensions.Logging;
using System.Net;

namespace Company.Function
{
    public class HttpTriggerCSharp
    {
        private readonly ILogger<HttpTriggerCSharp> _logger;
        
        public HttpTriggerCSharp(ILogger<HttpTriggerCSharp> logger)
        {
            _logger = logger;
        }
        
        [Function("HttpTriggerCSharp")]
        public HttpResponseData Run(
            [HttpTrigger(AuthorizationLevel.Function, "get", "post")] HttpRequestData req)
        {
            _logger.LogInformation("C# HTTP trigger function processed a request.");
            
            var response = req.CreateResponse(HttpStatusCode.OK);
            response.Headers.Add("Content-Type", "text/plain; charset=utf-8");
            response.WriteString($"Welcome to Azure Functions, {req.Query["name"]}!");
            
            return response;
        }
    }
}
```

**When to Use**:
- .NET Framework 4.8 (doesn't support ASP.NET Core types)
- Need low-level HTTP control
- Specific requirements for response building

### Step 7: Update local.settings.json

**In-Process**:
```json
{
  "IsEncrypted": false,
  "Values": {
    "AzureWebJobsStorage": "UseDevelopmentStorage=true",
    "FUNCTIONS_WORKER_RUNTIME": "dotnet"
  }
}
```

**Isolated**:
```json
{
  "IsEncrypted": false,
  "Values": {
    "AzureWebJobsStorage": "UseDevelopmentStorage=true",
    "FUNCTIONS_WORKER_RUNTIME": "dotnet-isolated"
  }
}
```

**Key Change**: `"dotnet"` → `"dotnet-isolated"`

### Step 8: Update host.json (Optional)

The `host.json` file typically **doesn't require changes** for migration. However, you may want to update logging configuration.

**Enhanced host.json** (with logging):
```json
{
  "version": "2.0",
  "logging": {
    "applicationInsights": {
      "samplingSettings": {
        "isEnabled": true,
        "maxTelemetryItemsPerSecond": 20
      }
    },
    "logLevel": {
      "default": "Information",
      "Microsoft": "Warning",
      "Microsoft.Hosting.Lifetime": "Information"
    }
  },
  "extensionBundle": {
    "id": "Microsoft.Azure.Functions.ExtensionBundle",
    "version": "[4.*, 5.0.0)"
  }
}
```

**Important Note**: In isolated model, `host.json` only controls **Functions host runtime logging**. Application logging is configured in `Program.cs`:

```csharp
.ConfigureLogging((context, logging) =>
{
    logging.AddFilter("Microsoft.Azure.Functions.Worker", LogLevel.Information);
    logging.AddFilter("My.Namespace", LogLevel.Debug);
})
```

---

## Complete Migration Examples

### Example 1: Timer-Triggered Function

#### In-Process

```csharp
using System;
using Microsoft.Azure.WebJobs;
using Microsoft.Extensions.Logging;

namespace Company.Function
{
    public static class TimerTriggerCSharp
    {
        [FunctionName("TimerTriggerCSharp")]
        public static void Run(
            [TimerTrigger("0 */5 * * * *")] TimerInfo myTimer,
            ILogger log)
        {
            log.LogInformation($"C# Timer trigger function executed at: {DateTime.Now}");
        }
    }
}
```

#### Isolated (.NET 8)

```csharp
using System;
using Microsoft.Azure.Functions.Worker;
using Microsoft.Extensions.Logging;

namespace Company.Function
{
    public class TimerTriggerCSharp
    {
        private readonly ILogger<TimerTriggerCSharp> _logger;
        
        public TimerTriggerCSharp(ILogger<TimerTriggerCSharp> logger)
        {
            _logger = logger;
        }
        
        [Function("TimerTriggerCSharp")]
        public void Run([TimerTrigger("0 */5 * * * *")] TimerInfo myTimer)
        {
            _logger.LogInformation($"C# Timer trigger function executed at: {DateTime.Now}");
        }
    }
}
```

### Example 2: Queue Trigger with Blob Output

#### In-Process

```csharp
using Microsoft.Azure.WebJobs;
using Microsoft.Extensions.Logging;

namespace Company.Function
{
    public static class QueueTriggerCSharp
    {
        [FunctionName("QueueTriggerCSharp")]
        public static void Run(
            [QueueTrigger("myqueue-items")] string myQueueItem,
            [Blob("output-container/{rand-guid}.txt", FileAccess.Write)] out string outputBlob,
            ILogger log)
        {
            log.LogInformation($"Processing queue item: {myQueueItem}");
            outputBlob = $"Processed: {myQueueItem}";
        }
    }
}
```

#### Isolated (.NET 8)

```csharp
using Microsoft.Azure.Functions.Worker;
using Microsoft.Extensions.Logging;

namespace Company.Function
{
    public class QueueTriggerCSharp
    {
        private readonly ILogger<QueueTriggerCSharp> _logger;
        
        public QueueTriggerCSharp(ILogger<QueueTriggerCSharp> logger)
        {
            _logger = logger;
        }
        
        [Function("QueueTriggerCSharp")]
        [BlobOutput("output-container/{rand-guid}.txt")]
        public string Run(
            [QueueTrigger("myqueue-items")] string myQueueItem)
        {
            _logger.LogInformation($"Processing queue item: {myQueueItem}");
            return $"Processed: {myQueueItem}";
        }
    }
}
```

### Example 3: Cosmos DB Trigger with Service Bus Output

#### In-Process

```csharp
using System.Collections.Generic;
using Microsoft.Azure.Documents;
using Microsoft.Azure.WebJobs;
using Microsoft.Extensions.Logging;

namespace Company.Function
{
    public static class CosmosDBTriggerCSharp
    {
        [FunctionName("CosmosDBTriggerCSharp")]
        public static void Run(
            [CosmosDBTrigger(
                databaseName: "MyDatabase",
                collectionName: "MyCollection",
                ConnectionStringSetting = "CosmosDBConnection",
                LeaseCollectionName = "leases")] IReadOnlyList<Document> documents,
            [ServiceBus("myqueue", Connection = "ServiceBusConnection")] out string outputMessage,
            ILogger log)
        {
            if (documents != null && documents.Count > 0)
            {
                log.LogInformation($"Documents modified: {documents.Count}");
                outputMessage = $"Processed {documents.Count} documents";
            }
            else
            {
                outputMessage = null;
            }
        }
    }
}
```

#### Isolated (.NET 8)

```csharp
using System.Collections.Generic;
using Microsoft.Azure.Functions.Worker;
using Microsoft.Extensions.Logging;

namespace Company.Function
{
    public class CosmosDBTriggerCSharp
    {
        private readonly ILogger<CosmosDBTriggerCSharp> _logger;
        
        public CosmosDBTriggerCSharp(ILogger<CosmosDBTriggerCSharp> logger)
        {
            _logger = logger;
        }
        
        [Function("CosmosDBTriggerCSharp")]
        [ServiceBusOutput("myqueue", Connection = "ServiceBusConnection")]
        public string Run(
            [CosmosDBTrigger(
                databaseName: "MyDatabase",
                containerName: "MyCollection",  // Note: collectionName → containerName
                Connection = "CosmosDBConnection",
                LeaseContainerName = "leases")] IReadOnlyList<MyDocument> documents)
        {
            if (documents != null && documents.Count > 0)
            {
                _logger.LogInformation($"Documents modified: {documents.Count}");
                return $"Processed {documents.Count} documents";
            }
            
            return null;
        }
    }
    
    public class MyDocument
    {
        public string Id { get; set; }
        public string Name { get; set; }
        // Other properties
    }
}
```

**Key Changes**:
1. `collectionName` → `containerName`
2. `IReadOnlyList<Document>` → `IReadOnlyList<MyDocument>` (strongly typed)
3. Output binding moved to return value with attribute

### Example 4: Dependency Injection Example

#### In-Process

```csharp
// Startup.cs
using Microsoft.Azure.Functions.Extensions.DependencyInjection;
using Microsoft.Extensions.DependencyInjection;

[assembly: FunctionsStartup(typeof(MyNamespace.Startup))]

namespace MyNamespace
{
    public class Startup : FunctionsStartup
    {
        public override void Configure(IFunctionsHostBuilder builder)
        {
            builder.Services.AddHttpClient();
            builder.Services.AddSingleton<IMyService, MyService>();
        }
    }
}

// Function.cs
using Microsoft.Azure.WebJobs;
using Microsoft.Extensions.Logging;

namespace MyNamespace
{
    public class MyFunction
    {
        private readonly IMyService _myService;
        
        public MyFunction(IMyService myService)
        {
            _myService = myService;
        }
        
        [FunctionName("MyFunction")]
        public void Run(
            [TimerTrigger("0 */5 * * * *")] TimerInfo myTimer,
            ILogger log)
        {
            var result = _myService.DoWork();
            log.LogInformation(result);
        }
    }
}
```

#### Isolated (.NET 8)

```csharp
// Program.cs
using Microsoft.Azure.Functions.Worker;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Hosting;

var host = new HostBuilder()
    .ConfigureFunctionsWebApplication()
    .ConfigureServices(services =>
    {
        services.AddApplicationInsightsTelemetryWorkerService();
        services.ConfigureFunctionsApplicationInsights();
        
        // Your dependencies
        services.AddHttpClient();
        services.AddSingleton<IMyService, MyService>();
    })
    .Build();

host.Run();

// Function.cs
using Microsoft.Azure.Functions.Worker;
using Microsoft.Extensions.Logging;

namespace MyNamespace
{
    public class MyFunction
    {
        private readonly IMyService _myService;
        private readonly ILogger<MyFunction> _logger;
        
        public MyFunction(IMyService myService, ILogger<MyFunction> logger)
        {
            _myService = myService;
            _logger = logger;
        }
        
        [Function("MyFunction")]
        public void Run([TimerTrigger("0 */5 * * * *")] TimerInfo myTimer)
        {
            var result = _myService.DoWork();
            _logger.LogInformation(result);
        }
    }
}
```

---

## Advanced Features: Middleware

One of the biggest advantages of the isolated worker model is **middleware support**, similar to ASP.NET Core.

### Creating Custom Middleware

```csharp
using Microsoft.Azure.Functions.Worker;
using Microsoft.Azure.Functions.Worker.Middleware;
using Microsoft.Extensions.Logging;
using System.Diagnostics;

public class PerformanceMiddleware : IFunctionsWorkerMiddleware
{
    private readonly ILogger<PerformanceMiddleware> _logger;
    
    public PerformanceMiddleware(ILogger<PerformanceMiddleware> logger)
    {
        _logger = logger;
    }
    
    public async Task Invoke(FunctionContext context, FunctionExecutionDelegate next)
    {
        var stopwatch = Stopwatch.StartNew();
        
        try
        {
            _logger.LogInformation($"Function {context.FunctionDefinition.Name} starting");
            
            // Call next middleware/function
            await next(context);
            
            stopwatch.Stop();
            _logger.LogInformation(
                $"Function {context.FunctionDefinition.Name} completed in {stopwatch.ElapsedMilliseconds}ms");
        }
        catch (Exception ex)
        {
            stopwatch.Stop();
            _logger.LogError(ex, 
                $"Function {context.FunctionDefinition.Name} failed after {stopwatch.ElapsedMilliseconds}ms");
            throw;
        }
    }
}
```

### Exception Handling Middleware

```csharp
using Microsoft.Azure.Functions.Worker;
using Microsoft.Azure.Functions.Worker.Middleware;
using Microsoft.Extensions.Logging;

public class ExceptionHandlingMiddleware : IFunctionsWorkerMiddleware
{
    private readonly ILogger<ExceptionHandlingMiddleware> _logger;
    
    public ExceptionHandlingMiddleware(ILogger<ExceptionHandlingMiddleware> logger)
    {
        _logger = logger;
    }
    
    public async Task Invoke(FunctionContext context, FunctionExecutionDelegate next)
    {
        try
        {
            await next(context);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Unhandled exception in function {FunctionName}", 
                context.FunctionDefinition.Name);
            
            // Custom error handling logic
            // Can modify response, send alerts, etc.
            
            throw; // Re-throw to let Functions runtime handle it
        }
    }
}
```

### Registering Middleware

```csharp
// Program.cs
using Microsoft.Azure.Functions.Worker;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Hosting;

var host = new HostBuilder()
    .ConfigureFunctionsWebApplication(builder =>
    {
        // Register middleware (order matters!)
        builder.UseMiddleware<ExceptionHandlingMiddleware>();
        builder.UseMiddleware<PerformanceMiddleware>();
    })
    .ConfigureServices(services =>
    {
        services.AddApplicationInsightsTelemetryWorkerService();
        services.ConfigureFunctionsApplicationInsights();
    })
    .Build();

host.Run();
```

### Authentication Middleware Example

```csharp
using Microsoft.Azure.Functions.Worker;
using Microsoft.Azure.Functions.Worker.Http;
using Microsoft.Azure.Functions.Worker.Middleware;
using System.Net;

public class AuthenticationMiddleware : IFunctionsWorkerMiddleware
{
    public async Task Invoke(FunctionContext context, FunctionExecutionDelegate next)
    {
        var requestData = await context.GetHttpRequestDataAsync();
        
        if (requestData != null)
        {
            // Check for API key
            if (!requestData.Headers.TryGetValues("X-API-Key", out var apiKeyValues))
            {
                var response = requestData.CreateResponse(HttpStatusCode.Unauthorized);
                response.WriteString("API Key missing");
                
                context.GetInvocationResult().Value = response;
                return; // Short-circuit pipeline
            }
            
            // Validate API key
            var apiKey = apiKeyValues.FirstOrDefault();
            if (!IsValidApiKey(apiKey))
            {
                var response = requestData.CreateResponse(HttpStatusCode.Forbidden);
                response.WriteString("Invalid API Key");
                
                context.GetInvocationResult().Value = response;
                return;
            }
        }
        
        await next(context);
    }
    
    private bool IsValidApiKey(string apiKey)
    {
        // Your validation logic
        return !string.IsNullOrEmpty(apiKey);
    }
}
```

---

## Testing Isolated Functions

### Unit Testing Setup

**Install Testing Packages**:
```xml
<ItemGroup>
  <PackageReference Include="Microsoft.NET.Test.Sdk" Version="17.8.0" />
  <PackageReference Include="xunit" Version="2.6.2" />
  <PackageReference Include="xunit.runner.visualstudio" Version="2.5.4" />
  <PackageReference Include="Moq" Version="4.20.70" />
  <PackageReference Include="FluentAssertions" Version="6.12.0" />
</ItemGroup>
```

### Unit Test Example

```csharp
using Microsoft.Extensions.Logging;
using Moq;
using Xunit;

public class MyFunctionTests
{
    private readonly Mock<ILogger<MyFunction>> _loggerMock;
    private readonly Mock<IMyService> _serviceMock;
    private readonly MyFunction _function;
    
    public MyFunctionTests()
    {
        _loggerMock = new Mock<ILogger<MyFunction>>();
        _serviceMock = new Mock<IMyService>();
        _function = new MyFunction(_serviceMock.Object, _loggerMock.Object);
    }
    
    [Fact]
    public void Run_ShouldProcessMessage_Successfully()
    {
        // Arrange
        var message = "test message";
        _serviceMock.Setup(s => s.ProcessMessage(message))
                    .Returns("processed: test message");
        
        // Act
        var result = _function.Run(message);
        
        // Assert
        result.Should().Be("processed: test message");
        _serviceMock.Verify(s => s.ProcessMessage(message), Times.Once);
    }
}
```

### HTTP Function Testing

```csharp
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Logging;
using Moq;
using Xunit;

public class HttpFunctionTests
{
    [Fact]
    public void HttpTrigger_ShouldReturnOk_WithValidRequest()
    {
        // Arrange
        var loggerMock = new Mock<ILogger<HttpTriggerCSharp>>();
        var function = new HttpTriggerCSharp(loggerMock.Object);
        
        var context = new DefaultHttpContext();
        context.Request.QueryString = new QueryString("?name=Test");
        var request = context.Request;
        
        // Act
        var result = function.Run(request) as OkObjectResult;
        
        // Assert
        result.Should().NotBeNull();
        result.StatusCode.Should().Be(200);
        result.Value.Should().Be("Welcome to Azure Functions, Test!");
    }
}
```

---

## Deploying to Azure

### Using Deployment Slots (Recommended)

Deployment slots minimize downtime and allow testing before production swap.

#### Step 1: Create Staging Slot

**Azure CLI**:
```bash
az functionapp deployment slot create \
    --name <FUNCTION_APP_NAME> \
    --resource-group <RESOURCE_GROUP> \
    --slot staging
```

**Azure Portal**:
1. Navigate to Function App
2. Go to **Deployment** → **Deployment slots**
3. Click **Add Slot**
4. Name: `staging`

#### Step 2: Update Staging Slot Configuration

**Set Worker Runtime**:
```bash
az functionapp config appsettings set \
    --name <FUNCTION_APP_NAME> \
    --resource-group <RESOURCE_GROUP> \
    --slot staging \
    --settings FUNCTIONS_WORKER_RUNTIME=dotnet-isolated
```

**Update Stack Configuration** (.NET 8):

Azure Portal:
1. Go to staging slot
2. **Configuration** → **General settings**
3. **Stack**: .NET
4. **Version**: .NET 8 (LTS) Isolated
5. Click **Save**

Azure CLI:
```bash
az functionapp config set \
    --name <FUNCTION_APP_NAME> \
    --resource-group <RESOURCE_GROUP> \
    --slot staging \
    --net-framework-version v8.0
```

#### Step 3: Deploy to Staging Slot

**Visual Studio**:
1. Right-click project → **Publish**
2. Target: Azure Function App (Windows/Linux)
3. Select staging slot
4. Publish

**Azure CLI**:
```bash
func azure functionapp publish <FUNCTION_APP_NAME> --slot staging
```

**GitHub Actions** (see CI/CD section)

#### Step 4: Test in Staging

1. Navigate to staging slot URL
2. Test all functions
3. Monitor Application Insights
4. Check logs for errors

#### Step 5: Swap to Production

**Azure Portal**:
1. Go to Function App
2. **Deployment** → **Deployment slots**
3. Click **Swap**
4. Source: staging
5. Target: production
6. Review changes
7. Click **Swap**

**Azure CLI**:
```bash
az functionapp deployment slot swap \
    --name <FUNCTION_APP_NAME> \
    --resource-group <RESOURCE_GROUP> \
    --slot staging
```

**Result**: Atomic swap with zero downtime.

#### Step 6: Verify Production

1. Test production endpoints
2. Monitor Application Insights
3. Check for errors

### Direct Deployment (Not Recommended for Production)

If not using slots, update configuration before deploying:

```bash
# Update runtime
az functionapp config appsettings set \
    --name <FUNCTION_APP_NAME> \
    --resource-group <RESOURCE_GROUP> \
    --settings FUNCTIONS_WORKER_RUNTIME=dotnet-isolated

# Update .NET version
az functionapp config set \
    --name <FUNCTION_APP_NAME> \
    --resource-group <RESOURCE_GROUP> \
    --net-framework-version v8.0

# Deploy
func azure functionapp publish <FUNCTION_APP_NAME>
```

**Warning**: This causes downtime and error state during deployment.

---

## CI/CD Pipeline Examples

### GitHub Actions

```yaml
name: Deploy Azure Function

on:
  push:
    branches:
      - main

env:
  AZURE_FUNCTIONAPP_NAME: 'your-function-app-name'
  AZURE_FUNCTIONAPP_PACKAGE_PATH: '.'
  DOTNET_VERSION: '8.0.x'

jobs:
  build-and-deploy:
    runs-on: ubuntu-latest
    steps:
    - name: 'Checkout GitHub Action'
      uses: actions/checkout@v3

    - name: Setup .NET ${{ env.DOTNET_VERSION }}
      uses: actions/setup-dotnet@v3
      with:
        dotnet-version: ${{ env.DOTNET_VERSION }}

    - name: 'Restore dependencies'
      run: dotnet restore
      
    - name: 'Build project'
      run: dotnet build --configuration Release --no-restore
      
    - name: 'Run tests'
      run: dotnet test --no-build --verbosity normal

    - name: 'Publish'
      run: dotnet publish --configuration Release --output ./output

    - name: 'Deploy to Azure Functions'
      uses: Azure/functions-action@v1
      with:
        app-name: ${{ env.AZURE_FUNCTIONAPP_NAME }}
        package: './output'
        publish-profile: ${{ secrets.AZURE_FUNCTIONAPP_PUBLISH_PROFILE }}
```

### Azure DevOps Pipeline

```yaml
trigger:
  branches:
    include:
      - main

pool:
  vmImage: 'ubuntu-latest'

variables:
  buildConfiguration: 'Release'
  dotnetVersion: '8.0.x'
  azureFunctionAppName: 'your-function-app-name'

stages:
- stage: Build
  jobs:
  - job: BuildJob
    steps:
    - task: UseDotNet@2
      inputs:
        packageType: 'sdk'
        version: $(dotnetVersion)
        
    - task: DotNetCoreCLI@2
      displayName: 'Restore'
      inputs:
        command: 'restore'
        
    - task: DotNetCoreCLI@2
      displayName: 'Build'
      inputs:
        command: 'build'
        arguments: '--configuration $(buildConfiguration) --no-restore'
        
    - task: DotNetCoreCLI@2
      displayName: 'Test'
      inputs:
        command: 'test'
        arguments: '--no-build --verbosity normal'
        
    - task: DotNetCoreCLI@2
      displayName: 'Publish'
      inputs:
        command: 'publish'
        arguments: '--configuration $(buildConfiguration) --output $(Build.ArtifactStagingDirectory)'
        zipAfterPublish: true
        
    - task: PublishBuildArtifacts@1
      inputs:
        PathtoPublish: '$(Build.ArtifactStagingDirectory)'
        ArtifactName: 'drop'

- stage: Deploy
  dependsOn: Build
  jobs:
  - deployment: DeployJob
    environment: 'production'
    strategy:
      runOnce:
        deploy:
          steps:
          - task: AzureFunctionApp@2
            inputs:
              azureSubscription: 'Your-Azure-Subscription'
              appType: 'functionApp'
              appName: $(azureFunctionAppName)
              package: '$(Pipeline.Workspace)/drop/*.zip'
```

---

## Troubleshooting Common Issues

### Issue 1: "The gRPC channel URI could not be parsed"

**Symptoms**:
```
System.InvalidOperationException: 'The gRPC channel URI 'http://:' could not be parsed.'
```

**Solutions**:

1. **Clean build folders**:
   ```bash
   rm -rf bin obj
   dotnet clean
   dotnet build
   ```

2. **Check local.settings.json**:
   ```json
   {
     "Values": {
       "FUNCTIONS_WORKER_RUNTIME": "dotnet-isolated"
     }
   }
   ```

3. **Restart IDE** (Visual Studio/Rider)

4. **Update Azure Functions Core Tools**:
   ```bash
   npm install -g azure-functions-core-tools@4
   ```

### Issue 2: Extension Bundle Version Error

**Symptoms**:
```
Referenced bundle Microsoft.Azure.Functions.ExtensionBundle of version 1.8.1 
does not meet the required minimum version of 2.6.1
```

**Solution**: Update `host.json`:
```json
{
  "version": "2.0",
  "extensionBundle": {
    "id": "Microsoft.Azure.Functions.ExtensionBundle",
    "version": "[4.*, 5.0.0)"
  }
}
```

### Issue 3: "0 functions loaded"

**Symptoms**: Functions not discovered after migration.

**Solutions**:

1. **Check `OutputType` in .csproj**:
   ```xml
   <OutputType>Exe</OutputType>
   ```

2. **Verify `Program.cs` exists**

3. **Check function attribute**:
   ```csharp
   [Function("MyFunction")]  // Not [FunctionName]
   ```

4. **Clean and rebuild**:
   ```bash
   dotnet clean
   dotnet build
   ```

### Issue 4: Dependency Injection Not Working

**Symptoms**: Services not resolved, null reference exceptions.

**Solutions**:

1. **Register services in `Program.cs`**:
   ```csharp
   .ConfigureServices(services => {
       services.AddSingleton<IMyService, MyService>();
   })
   ```

2. **Use constructor injection**:
   ```csharp
   public MyFunction(IMyService service)
   {
       _service = service;
   }
   ```

3. **Don't use static classes**:
   ```csharp
   // ❌ Wrong
   public static class MyFunction { }
   
   // ✅ Correct
   public class MyFunction { }
   ```

### Issue 5: HTTP Triggers Not Working

**Symptoms**: 404 errors, routes not found.

**Solutions**:

1. **Add ASP.NET Core integration package**:
   ```xml
   <PackageReference Include="Microsoft.Azure.Functions.Worker.Extensions.Http.AspNetCore" Version="1.2.1" />
   ```

2. **Use `ConfigureFunctionsWebApplication()`**:
   ```csharp
   .ConfigureFunctionsWebApplication()
   ```

3. **Check route configuration**:
   ```csharp
   [HttpTrigger(AuthorizationLevel.Function, "get", Route = "api/myfunction")]
   ```

### Issue 6: Application Insights Not Logging

**Symptoms**: Missing logs in Application Insights.

**Solutions**:

1. **Add Application Insights packages**:
   ```xml
   <PackageReference Include="Microsoft.ApplicationInsights.WorkerService" Version="2.22.0" />
   <PackageReference Include="Microsoft.Azure.Functions.Worker.ApplicationInsights" Version="1.2.0" />
   ```

2. **Configure in `Program.cs`**:
   ```csharp
   services.AddApplicationInsightsTelemetryWorkerService();
   services.ConfigureFunctionsApplicationInsights();
   ```

3. **Set connection string**:
   ```json
   {
     "Values": {
       "APPLICATIONINSIGHTS_CONNECTION_STRING": "your-connection-string"
     }
   }
   ```

4. **Configure log filtering**:
   ```csharp
   .ConfigureLogging(logging => {
       logging.AddFilter("Microsoft.Azure.Functions.Worker", LogLevel.Information);
   })
   ```

### Issue 7: Binding Extensions Not Found

**Symptoms**:
```
No job functions found. Try making your job classes and methods public.
```

**Solutions**:

1. **Install correct extension packages**:
   ```bash
   dotnet add package Microsoft.Azure.Functions.Worker.Extensions.Storage.Queues
   ```

2. **Check namespace**:
   ```csharp
   using Microsoft.Azure.Functions.Worker;
   // Not: using Microsoft.Azure.WebJobs;
   ```

3. **Verify binding attribute names**:
   ```csharp
   [QueueOutput("myqueue")]  // Not [Queue]
   ```

---

## Performance Optimization

### Cold Start Optimization

**1. Enable ReadyToRun Compilation**:

```xml
<PropertyGroup>
  <PublishReadyToRun>true</PublishReadyToRun>
</PropertyGroup>
```

**2. Use Consumption Plan Optimizations**:

```json
{
  "version": "2.0",
  "functionTimeout": "00:05:00",
  "logging": {
    "applicationInsights": {
      "samplingSettings": {
        "isEnabled": true
      }
    }
  }
}
```

**3. Minimize Dependencies**: Only include necessary packages.

### Memory Optimization

**1. Configure Function App Settings**:

```bash
az functionapp config appsettings set \
    --settings WEBSITE_MEMORY_LIMIT_MB=1536
```

**2. Use Singleton Services**:

```csharp
services.AddSingleton<IHeavyService, HeavyService>();
```

**3. Dispose Resources Properly**:

```csharp
public class MyFunction : IDisposable
{
    private readonly HttpClient _httpClient;
    
    public void Dispose()
    {
        _httpClient?.Dispose();
    }
}
```

### HTTP Performance

**Use ASP.NET Core Integration**:

```csharp
.ConfigureFunctionsWebApplication()  // Faster than ConfigureFunctionsWorkerDefaults
```

**Enable HTTP Response Compression** (if applicable):

```csharp
services.AddResponseCompression();
```

---

## Best Practices

### 1. **Use Dependency Injection Properly**

**Correct Lifetimes**:
```csharp
// Singleton: Shared across all function invocations
services.AddSingleton<ICacheService, CacheService>();

// Scoped: One instance per function invocation
services.AddScoped<IOrderService, OrderService>();

// Transient: New instance every time
services.AddTransient<IEmailService, EmailService>();
```

### 2. **Implement Proper Error Handling**

```csharp
public class MyFunction
{
    [Function("MyFunction")]
    public async Task<HttpResponseData> Run(
        [HttpTrigger(AuthorizationLevel.Function, "post")] HttpRequestData req)
    {
        try
        {
            // Function logic
            var response = req.CreateResponse(HttpStatusCode.OK);
            return response;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error processing request");
            var errorResponse = req.CreateResponse(HttpStatusCode.InternalServerError);
            await errorResponse.WriteAsJsonAsync(new { error = "Internal server error" });
            return errorResponse;
        }
    }
}
```

### 3. **Use Structured Logging**

```csharp
_logger.LogInformation(
    "Processing order {OrderId} for customer {CustomerId}",
    order.Id,
    customer.Id);
```

### 4. **Implement Health Checks**

```csharp
[Function("HealthCheck")]
public HttpResponseData HealthCheck(
    [HttpTrigger(AuthorizationLevel.Anonymous, "get", Route = "health")] HttpRequestData req)
{
    var response = req.CreateResponse(HttpStatusCode.OK);
    response.WriteString("Healthy");
    return response;
}
```

### 5. **Use Configuration Appropriately**

```csharp
.ConfigureServices((context, services) =>
{
    // Bind configuration sections to strongly-typed options
    services.Configure<MyOptions>(context.Configuration.GetSection("MyOptions"));
    
    // Use IOptions<T> in functions
    services.AddSingleton<IMyService, MyService>();
})
```

### 6. **Implement Retry Policies**

```csharp
services.AddHttpClient<IMyApiClient, MyApiClient>()
    .AddPolicyHandler(GetRetryPolicy());

static IAsyncPolicy<HttpResponseMessage> GetRetryPolicy()
{
    return HttpPolicyExtensions
        .HandleTransientHttpError()
        .WaitAndRetryAsync(3, retryAttempt => 
            TimeSpan.FromSeconds(Math.Pow(2, retryAttempt)));
}
```

### 7. **Monitor and Alert**

- Enable Application Insights
- Set up alerts for errors
- Monitor performance metrics
- Track custom telemetry

---

## Conclusion

Migrating from **.NET 6 in-process** to **.NET 8 isolated worker model** provides significant benefits:

✅ **Future-proof**: Supported beyond November 2026  
✅ **Flexibility**: Use any .NET version  
✅ **Modern features**: Middleware, improved DI, ASP.NET Core integration  
✅ **Better testing**: Easier unit and integration testing  
✅ **Performance**: Optimized for HTTP triggers  

### Migration Summary

**Key Steps**:
1. Update `.csproj` (target framework, packages, output type)
2. Replace binding packages (WebJobs → Worker)
3. Create `Program.cs` (replace `Startup.cs`)
4. Update function signatures (attributes, logging, bindings)
5. Test thoroughly in staging environment
6. Deploy using deployment slots for zero downtime

**Timeline**:
- **Small apps**: 2-4 hours
- **Medium apps**: 1-2 days
- **Large apps**: 1-2 weeks (with comprehensive testing)

### Next Steps

1. **Assess Your Applications**: Identify all in-process functions
2. **Plan Migration**: Prioritize based on complexity and business impact
3. **Set Up Staging**: Create deployment slots for safe testing
4. **Migrate Incrementally**: Start with simplest functions
5. **Test Extensively**: Unit tests, integration tests, load tests
6. **Monitor Post-Migration**: Application Insights, error logs
7. **Document Changes**: Update internal documentation

### Additional Resources

**Official Documentation**:
- [Migrate .NET apps to isolated worker model](https://learn.microsoft.com/azure/azure-functions/migrate-dotnet-to-isolated-model)
- [Isolated worker model guide](https://learn.microsoft.com/azure/azure-functions/dotnet-isolated-process-guide)
- [Differences between models](https://learn.microsoft.com/azure/azure-functions/dotnet-isolated-in-process-differences)

**Tools**:
- [.NET Upgrade Assistant](https://dotnet.microsoft.com/platform/upgrade-assistant)
- [Azure Functions Core Tools](https://github.com/Azure/azure-functions-core-tools)

**Community**:
- [Azure Functions GitHub](https://github.com/Azure/azure-functions-dotnet-worker)
- [Microsoft Q&A](https://learn.microsoft.com/answers/tags/133/azure-functions)

---

*This guide provides comprehensive technical instructions for migrating Azure Functions to the isolated worker model. Always test thoroughly in non-production environments before deploying to production.*