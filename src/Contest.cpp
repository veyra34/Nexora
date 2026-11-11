#include "../include/Contest.h"
#include <iostream>

using namespace std;

Contest::Contest(
    int id,
    string name,
    string platform,
    string startTime
) {
    this->contestId = id;
    this->name = name;
    this->platform = platform;
    this->startTime = startTime;
}

void Contest::displayDetails() const {
    cout << "\nContest ID: " << contestId << endl;
    cout << "Name: " << name << endl;
    cout << "Platform: " << platform << endl;
    cout << "Start Time: " << startTime << endl;
}

int Contest::getContestId() const {
    return contestId;
}

string Contest::getName() const {
    return name;
}