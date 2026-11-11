#include "../include/Problem.h"
#include <iostream>
#include <stdexcept>
using namespace std;

ProblemSummary::ProblemSummary(int id, string name) {
problemId = id;
title = name;
}

void ProblemSummary::displaySummary() const {
cout << "Problem Summary" << endl;
cout << "Problem ID: " << problemId << endl;
cout << "Title: " << title << endl;
}

Problem::Problem(string id, string title, string difficulty) {
problemId = id;
this->title = title;
this->difficulty = difficulty;
}

Problem::Problem(int id) {
problemId = to_string(id);
title = "Unknown";
difficulty = "Unknown";
}

Problem::operator int() const {
try {
return stoi(problemId);
}
catch (const invalid_argument&) {
throw invalid_argument("Problem ID must contain a valid integer.");
}
catch (const out_of_range&) {
throw out_of_range("Problem ID is outside the integer range.");
}
}

Problem::operator ProblemSummary() const {
return ProblemSummary(stoi(problemId), title);
}

void Problem::displayProblem() {
cout << "Problem ID: " << problemId << endl;
cout << "Title: " << title << endl;
cout << "Difficulty: " << difficulty << endl;
}

bool Problem::operator==(const Problem& other) const {
return problemId == other.problemId;
}

ostream& operator<<(ostream& out, const Problem& problem) {
out << "Problem ID: " << problem.problemId << endl;
out << "Title: " << problem.title << endl;
out << "Difficulty: " << problem.difficulty << endl;

return out;

}

istream& operator>>(istream& in, Problem& problem) {
in >> problem.problemId
>> problem.title
>> problem.difficulty;

return in;


}
