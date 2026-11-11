#ifndef CONTEST_H
#define CONTEST_H

#include <string>
using namespace std;

class Contest {
private:
    int contestId;
    string name;
    string platform;
    string startTime;

public:
    Contest(int id, string name, string platform, string startTime);

    void displayDetails() const;

    int getContestId() const;
    string getName() const;
};

#endif