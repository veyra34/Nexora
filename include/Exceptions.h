#ifndef EXCEPTIONS_H
#define EXCEPTIONS_H

#include <exception>
using namespace std;

class NexoraException : public exception {
public:
const char* what() const noexcept override {
return "A Nexora error occurred.";
}
};

class ContestNotFoundException : public NexoraException {
public:
const char* what() const noexcept override {
return "Contest not found!";
}
};

class InvalidContestIDException : public NexoraException {
public:
const char* what() const noexcept override {
return "Invalid contest ID!";
}
};

#endif
