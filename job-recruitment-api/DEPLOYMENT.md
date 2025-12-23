# Job Recruitment API - Deployment Guide

## Prerequisites

1. **Java 17+** - Already installed ✓
2. **Maven 3.8+** - Already installed ✓
3. **MySQL 8.0+** - Database server
4. **WildFly 30+** - Application server

---

## Step 1: Download and Install WildFly

### Option A: Download WildFly (Recommended)

1. Go to: https://www.wildfly.org/downloads/
2. Download **WildFly 30.0.1.Final** (or newer)
3. Extract to a folder, e.g., `C:\wildfly-30.0.1.Final`
4. Set environment variable:
   ```cmd
   setx WILDFLY_HOME "C:\wildfly-30.0.1.Final"
   ```

### Option B: Use Chocolatey (if installed)
```cmd
choco install wildfly
```

---

## Step 2: Setup MySQL Database

### 2.1 Start MySQL Server
Make sure MySQL is running on `localhost:3306`

### 2.2 Run Database Setup Script
```cmd
mysql -u root -p < database-setup.sql
```

Or in MySQL Workbench:
1. Open `database-setup.sql`
2. Execute the script

This creates:
- `recruitment` database
- All required tables
- Admin user: `admin@recruitment.com` / `admin123`

---

## Step 3: Configure WildFly

### 3.1 Add MySQL Driver Module

1. Download MySQL Connector/J from: https://dev.mysql.com/downloads/connector/j/
2. Create directory: `%WILDFLY_HOME%\modules\system\layers\base\com\mysql\main`
3. Copy `mysql-connector-j-8.x.x.jar` to that directory
4. Create `module.xml` in the same directory:

```xml
<?xml version="1.0" encoding="UTF-8"?>
<module xmlns="urn:jboss:module:1.9" name="com.mysql">
    <resources>
        <resource-root path="mysql-connector-j-8.2.0.jar"/>
    </resources>
    <dependencies>
        <module name="javax.api"/>
        <module name="javax.transaction.api"/>
    </dependencies>
</module>
```

### 3.2 Configure Datasource

Edit `%WILDFLY_HOME%\standalone\configuration\standalone.xml`:

Find the `<datasources>` section and add:

```xml
<datasource jndi-name="java:jboss/datasources/RecruitmentDS" pool-name="RecruitmentDS" enabled="true" use-java-context="true">
    <connection-url>jdbc:mysql://localhost:3306/recruitment?useSSL=false&amp;allowPublicKeyRetrieval=true&amp;serverTimezone=UTC</connection-url>
    <driver>mysql</driver>
    <security>
        <user-name>root</user-name>
        <password>YOUR_MYSQL_PASSWORD</password>
    </security>
    <validation>
        <valid-connection-checker class-name="org.jboss.jca.adapters.jdbc.extensions.mysql.MySQLValidConnectionChecker"/>
        <exception-sorter class-name="org.jboss.jca.adapters.jdbc.extensions.mysql.MySQLExceptionSorter"/>
    </validation>
</datasource>
```

Find the `<drivers>` section and add:

```xml
<driver name="mysql" module="com.mysql">
    <driver-class>com.mysql.cj.jdbc.Driver</driver-class>
</driver>
```

---

## Step 4: Deploy the Application

### Option A: Manual Deployment
```cmd
copy target\job-recruitment-api.war "%WILDFLY_HOME%\standalone\deployments\"
```

### Option B: Use Deploy Script
```cmd
deploy-wildfly.bat
```

---

## Step 5: Start WildFly

```cmd
cd %WILDFLY_HOME%\bin
standalone.bat
```

Wait for the message:
```
WFLYSRV0025: WildFly Full 30.0.1.Final started
```

---

## Step 6: Test the API

### Health Check
```
GET http://localhost:8080/job-recruitment-api/api/jobs
```

### Register a User
```bash
curl -X POST http://localhost:8080/job-recruitment-api/api/auth/register ^
  -H "Content-Type: application/json" ^
  -d "{\"email\": \"test@example.com\", \"password\": \"password123\", \"role\": \"CANDIDATE\", \"firstName\": \"John\", \"lastName\": \"Doe\"}"
```

### Login
```bash
curl -X POST http://localhost:8080/job-recruitment-api/api/auth/login ^
  -H "Content-Type: application/json" ^
  -d "{\"email\": \"admin@recruitment.com\", \"password\": \"admin123\"}"
```

---

## API Endpoints Summary

| Endpoint | Method | Description | Auth |
|----------|--------|-------------|------|
| `/api/auth/register` | POST | Register user | No |
| `/api/auth/login` | POST | Login | No |
| `/api/jobs` | GET | List jobs | No |
| `/api/jobs/{id}` | GET | Get job details | No |
| `/api/jobs/apply` | POST | Apply to job | Candidate |
| `/api/candidate/dashboard` | GET | Candidate stats | Candidate |
| `/api/candidate/applications` | GET | My applications | Candidate |
| `/api/enterprise/jobs` | GET/POST | Manage jobs | Enterprise |
| `/api/enterprise/applications` | GET/PUT | Manage applications | Enterprise |
| `/api/admin/users` | GET/PATCH/DELETE | Manage users | Admin |
| `/api/notifications` | GET | Get notifications | Any |
| `/api/profile` | GET/PUT | Manage profile | Any |

---

## Troubleshooting

### Error: "JNDI datasource not found"
- Check datasource name matches `java:jboss/datasources/RecruitmentDS`
- Verify MySQL module is correctly installed
- Check standalone.xml configuration

### Error: "Communications link failure"
- MySQL server is not running
- Wrong connection URL or credentials
- Firewall blocking port 3306

### Error: "Access denied for user"
- Wrong MySQL username/password in standalone.xml
- User doesn't have permissions on `recruitment` database

### View Server Logs
```cmd
type %WILDFLY_HOME%\standalone\log\server.log
```

---

## Production Considerations

1. **Change JWT Secret**: Update `microprofile-config.properties`
2. **Use Environment Variables**: For sensitive data
3. **Enable HTTPS**: Configure SSL in WildFly
4. **Connection Pooling**: Tune datasource pool settings
5. **Logging**: Configure appropriate log levels
