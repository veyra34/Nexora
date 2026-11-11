#ifndef CONTESTMANAGER_H
#define CONTESTMANAGER_H

#include "Contest.h"
#include <vector>
#include <string>

using namespace std;

class ContestManager {
public:

    class SearchCriteria {
    private:
        string keyword;

    public:
        SearchCriteria(string keyword);

        bool matches(const Contest& contest) const;
    };

private:
    vector<Contest> contests;

public:
    void addContest(const Contest& contest);

    void findContest(int contestId);
    void findContest(string contestName);

    void displayAllContests();
};

#endif