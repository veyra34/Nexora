#include "../include/ContestManager.h"
#include "../include/Exceptions.h"
#include <iostream>

using namespace std;

ContestManager::SearchCriteria::SearchCriteria(string keyword) {
this->keyword = keyword;
}

bool ContestManager::SearchCriteria::matches(
const Contest& contest
) const {
return contest.getName() == keyword;
}

void ContestManager::addContest(const Contest& contest) {
contests.push_back(contest);
}

void ContestManager::findContest(int contestId) {
try {
if (contestId <= 0) {
throw InvalidContestIDException();
}

    for (const Contest& contest : contests) {
        if (contest.getContestId() == contestId) {
            contest.displayDetails();
            return;
        }
    }

    throw ContestNotFoundException();
}
catch (const InvalidContestIDException& e) {
    cout << "Error: " << e.what() << endl;
}
catch (const NexoraException& e) {
    cout << "Error: " << e.what() << endl;
}

}

void ContestManager::findContest(string contestName) {
try {
if (contestName.empty()) {
throw NexoraException();
}
    SearchCriteria criteria(contestName);

    for (const Contest& contest : contests) {
        if (criteria.matches(contest)) {
            contest.displayDetails();
            return;
        }
    }

    throw ContestNotFoundException();
}
catch (const ContestNotFoundException& e) {
    cout << "Error: " << e.what() << endl;
}
catch (const NexoraException& e) {
    cout << "Error: " << e.what() << endl;
}


}

void ContestManager::displayAllContests() {
cout << "\n===== UPCOMING CONTESTS =====\n";

for (const Contest& contest : contests) {
    contest.displayDetails();
}

}
