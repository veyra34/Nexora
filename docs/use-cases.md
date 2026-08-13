# Use Case Specifications

## UC1: Register / Login

### Primary Actor
Competitive Programmer

### Stakeholders
- Competitive Programmer
- Contestify

### Preconditions
- The user has access to the Contestify application.
- For login, the user must already have an account.

### Postconditions
- The user is authenticated and can access the appropriate features.

### Trigger
The user opens Contestify and chooses to register or log in.

### Main Flow
1. The user opens the application.
2. The user selects Register or Login.
3. The user enters the required credentials.
4. The system validates the information.
5. The system authenticates the user.
6. The user is taken to the main application.

### Alternative Flows

**A1. Invalid credentials**
1. The system detects that the credentials are incorrect.
2. The system displays an error message.
3. The user is asked to try again.

**A2. Missing information**
1. The user leaves a required field empty.
2. The system asks the user to provide the missing information.