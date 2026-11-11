# Nexora — C++ Object-Oriented Programming (OOP) Architecture

This document provides a detailed mapping of every Object-Oriented Programming (OOP) concept implemented in the core C++ domain layer of **Nexora**. All existing C++ implementations are strictly preserved in [`include/`](file:///d:/Personal/CS%20Project/Nexora/include/) and [`src/`](file:///d:/Personal/CS%20Project/Nexora/src/), with execution verified in [`main.cpp`](file:///d:/Personal/CS%20Project/Nexora/main.cpp).

---

## 1. Class Hierarchy & Architecture Diagram

```
                 ┌──────────────────┐
                 │    User (Base)   │
                 └────────┬─────────┘
                          │
         ┌────────────────┼────────────────┐
         │ (virtual)      │ (virtual)      │ (public inheritance)
┌────────▼────────┐ ┌─────▼──────────┐ ┌───▼──────────┐
│CompetitiveProfile│ │PlatformProfile │ │  Contestant  │
└────────┬────────┘ └─────┬──────────┘ └──────────────┘
         │                │
         └────────┬───────┘
                  │ (Multiple inheritance)
         ┌────────▼────────┐
         │  NexoraMember   │
         └─────────────────┘

Independent Entities & Managers:
┌─────────────────┐       ┌─────────────────┐       ┌─────────────────┐
│     Contest     │◄──────┤ ContestManager  │       │     Account     │
└─────────────────┘       └─────────────────┘       └────────┬────────┘
                                                             │ (friend ==)
┌─────────────────┐       ┌─────────────────┐                ▼
│     Problem     ├──────►│ ProblemSummary  │         ┌───────────────┐
└─────────────────┘(cast) └─────────────────┘         │  User Entity  │
                                                      └───────────────┘
```

---

## 2. Concept-to-Code Mapping

| OOP Concept | Files / Locations | Implementation Highlights |
|---|---|---|
| **Encapsulation & Data Hiding** | [`include/User.h`](file:///d:/Personal/CS%20Project/Nexora/include/User.h#L10-L19)<br>[`include/Contest.h`](file:///d:/Personal/CS%20Project/Nexora/include/Contest.h#L8-L13) | `private` data members (`username`, `password`, `email`) accessible only through getters/methods; `protected` `userId` accessible by subclasses. |
| **Constructors & Initializer Lists** | [`src/User.cpp`](file:///d:/Personal/CS%20Project/Nexora/src/User.cpp#L8-L15)<br>[`src/Contestant.cpp`](file:///d:/Personal/CS%20Project/Nexora/src/Contestant.cpp#L6-L15) | Explicit base constructor invocation via member initialization list `: User(id, username, email, password)`. |
| **Single Inheritance** | [`include/Contestant.h`](file:///d:/Personal/CS%20Project/Nexora/include/Contestant.h#L6) | `class Contestant : public User` inherits core user identity and extends with contest participation tracking. |
| **Multiple & Diamond Inheritance** | [`include/NexoraMember.h`](file:///d:/Personal/CS%20Project/Nexora/include/NexoraMember.h#L7-L10) | `class NexoraMember : public CompetitiveProfile, public PlatformProfile` combines competitive features and platform profiles. |
| **Virtual Base Classes** | [`include/CompetitiveProfile.h`](file:///d:/Personal/CS%20Project/Nexora/include/CompetitiveProfile.h#L9)<br>[`include/PlatformProfile.h`](file:///d:/Personal/CS%20Project/Nexora/include/PlatformProfile.h#L9) | `virtual public User` ensures only **one** instance of `User` is constructed in the diamond hierarchy, eliminating ambiguity. |
| **Polymorphism & Virtual Functions** | [`include/User.h`](file:///d:/Personal/CS%20Project/Nexora/include/User.h#L25)<br>[`include/Contestant.h`](file:///d:/Personal/CS%20Project/Nexora/include/Contestant.h#L23) | `virtual void displayProfile();` in base `User`. Dynamic dispatch verified with base pointer (`User* userPtr = &contestant; userPtr->displayProfile();`). |
| **Method Overriding & `final` Keyword** | [`include/Contestant.h`](file:///d:/Personal/CS%20Project/Nexora/include/Contestant.h#L23) | `void displayProfile() final override;` prevents further overriding in deeper derived classes while fulfilling virtual contract. |
| **Method Overloading** | [`include/ContestManager.h`](file:///d:/Personal/CS%20Project/Nexora/include/ContestManager.h#L29-L30) | `void findContest(int contestId);`<br>`void findContest(string contestName);` |
| **Operator Overloading (Member & Binary)**| [`include/Problem.h`](file:///d:/Personal/CS%20Project/Nexora/include/Problem.h#L39)<br>[`src/Problem.cpp`](file:///d:/Personal/CS%20Project/Nexora/src/Problem.cpp#L51-L53) | `bool operator==(const Problem& other) const;` compares problem equality based on platform problem identifiers. |
| **Stream Operator Overloading** | [`include/Problem.h`](file:///d:/Personal/CS%20Project/Nexora/include/Problem.h#L41-L42)<br>[`src/Problem.cpp`](file:///d:/Personal/CS%20Project/Nexora/src/Problem.cpp#L55-L71) | `friend ostream& operator<<(ostream&, const Problem&);`<br>`friend istream& operator>>(istream&, Problem&);` for I/O serialization. |
| **Friend Functions** | [`include/User.h`](file:///d:/Personal/CS%20Project/Nexora/include/User.h#L32)<br>[`include/Account.h`](file:///d:/Personal/CS%20Project/Nexora/include/Account.h#L22)<br>[`src/Account.cpp`](file:///d:/Personal/CS%20Project/Nexora/src/Account.cpp#L25-L27) | `friend bool operator==(const User& user, const Account& account);` allows cross-class comparison of private credentials. |
| **Static Variables & Static Functions** | [`include/User.h`](file:///d:/Personal/CS%20Project/Nexora/include/User.h#L15-L30)<br>[`src/User.cpp`](file:///d:/Personal/CS%20Project/Nexora/src/User.cpp#L6-L36) | `static int totalUsers;` tracks global instantiated accounts; accessed via static method `User::getTotalUsers()`. |
| **Nested Classes** | [`include/ContestManager.h`](file:///d:/Personal/CS%20Project/Nexora/include/ContestManager.h#L13-L21) | `ContestManager::SearchCriteria` encapsulates search predicate logic inside `ContestManager`. |
| **Object Slicing** | [`main.cpp`](file:///d:/Personal/CS%20Project/Nexora/main.cpp#L168-L174) | `User slicedUser = contestant;` explicitly demonstrates value-copying a derived object into a base variable, dropping derived attributes. |
| **Type Conversion: Basic-to-Class** | [`include/Problem.h`](file:///d:/Personal/CS%20Project/Nexora/include/Problem.h#L31)<br>[`src/Problem.cpp`](file:///d:/Personal/CS%20Project/Nexora/src/Problem.cpp#L23-L27) | `Problem::Problem(int id)` allows implicit or explicit conversion from `int` to `Problem`. |
| **Type Conversion: Class-to-Basic** | [`include/Problem.h`](file:///d:/Personal/CS%20Project/Nexora/include/Problem.h#L33)<br>[`src/Problem.cpp`](file:///d:/Personal/CS%20Project/Nexora/src/Problem.cpp#L29-L39) | `Problem::operator int() const;` converts problem object to integer ID with range validation. |
| **Type Conversion: Class-to-Class** | [`include/Problem.h`](file:///d:/Personal/CS%20Project/Nexora/include/Problem.h#L35)<br>[`src/Problem.cpp`](file:///d:/Personal/CS%20Project/Nexora/src/Problem.cpp#L41-L43) | `Problem::operator ProblemSummary() const;` converts a full `Problem` into a compact `ProblemSummary` object. |
| **Templates (Function & Class)** | [`include/TemplateDemo.h`](file:///d:/Personal/CS%20Project/Nexora/include/TemplateDemo.h#L7-L30) | Generic `displayValue<T>` function template and `DataBox<T>` generic container class. |
| **Exception Handling Hierarchy** | [`include/Exceptions.h`](file:///d:/Personal/CS%20Project/Nexora/include/Exceptions.h#L7-L26) | Base `NexoraException : public std::exception`, derived `ContestNotFoundException` and `InvalidContestIDException`. |
| **RAII (Resource Acquisition Is Initialization)** | [`main.cpp`](file:///d:/Personal/CS%20Project/Nexora/main.cpp#L284-L300) | Demonstrates deterministic destructor cleanup during exception unwinding without manual finally blocks. |
| **`this` Pointer** | Throughout `src/*.cpp` | Differentiates member variables from parameters (e.g. `this->contestId = id;`). |

---

## 3. How C++ Fits Into the Nexora Mobile Architecture

The mobile application is built in React Native (Expo) and connects to Supabase (PostgreSQL + Auth) and the Codeforces API. The existing C++ layer serves as the **verified academic domain design**:
1. All domain logic rules (contest state matching, search criteria, problem difficulty classifications, user stats aggregation) directly correspond to the TypeScript service contracts in the mobile app.
2. The C++ code is fully preserved and buildable via standard C++17 compilers (`g++`, `clang++`, or `MSVC`) and CMake.
3. If an on-device or native bridge is required, the C++ code can be compiled into a native shared library or exposed via a lightweight REST service without rewriting the core OOP foundation.
