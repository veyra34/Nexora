# CRC Cards — Nexora

## 1. CRC Card — User

### Class
User

### Responsibilities
- Register for a Nexora account.
- Log in to Nexora.
- Provide required account information.
- Request upcoming contest information.
- View contest details.
- Request AI-based problem recommendations.

### Collaborators
- Account
- Contest
- Recommendation


---

## 2. CRC Card — Account

### Class
Account

### Responsibilities
- Store user account information.
- Support user registration.
- Support user authentication.
- Maintain the user's account information.

### Collaborators
- User


---

## 3. CRC Card — Contest

### Class
Contest

### Responsibilities
- Represent an upcoming programming contest.
- Store contest information.
- Provide contest timing and basic details.
- Support viewing contest details.

### Collaborators
- User


---

## 4. CRC Card — Problem

### Class
Problem

### Responsibilities
- Represent a competitive-programming problem.
- Provide problems that can be recommended for practice.
- Support AI-based problem recommendation.

### Collaborators
- Recommendation
- User


---

## 5. CRC Card — Recommendation

### Class
Recommendation

### Responsibilities
- Represent AI-generated problem recommendations.
- Receive the user's recommendation request or context.
- Provide relevant problem recommendations.
- Present recommendations to the user.

### Collaborators
- User
- Problem


---

## Summary

| Class | Main Responsibilities | Collaborators |
|---|---|---|
| User | Register, login, provide information, view contests, request recommendations | Account, Contest, Recommendation |
| Account | Store account information and support authentication | User |
| Contest | Represent and provide contest information and details | User |
| Problem | Represent competitive-programming problems for practice | Recommendation, User |
| Recommendation | Generate and provide relevant problem recommendations | User, Problem |