#ifndef PROBLEM_H
#define PROBLEM_H

#include <string>
#include <iostream>
using namespace std;

class ProblemSummary {
private:
int problemId;
string title;

public:
ProblemSummary(int id, string name);

void displaySummary() const;


};

class Problem {
private:
string problemId;
string title;
string difficulty;

public:
Problem(string id, string title, string difficulty);


Problem(int id);

operator int() const;

operator ProblemSummary() const;

void displayProblem();

bool operator==(const Problem& other) const;

friend ostream& operator<<(ostream& out, const Problem& problem);
friend istream& operator>>(istream& in, Problem& problem);


};

#endif
