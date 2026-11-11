#include "../include/Contestant.h"
#include <iostream>

using namespace std;

Contestant::Contestant(
    int id,
    string username,
    string email,
    string password,
    int contestsParticipated
) : User(id, username, email, password) {

    this->contestsParticipated = contestsParticipated;
}

void Contestant::participateInContest() {
    contestsParticipated++;

    cout << getUsername()
         << " joined a contest."
         << endl;
}

void Contestant::displayContestantProfile() {
    displayProfile();

    cout << "Contests Participated: "
         << contestsParticipated
         << endl;
}

void Contestant::displayProfile() {
    User::displayProfile();

    cout << "Contestant Status: Active" << endl;
}