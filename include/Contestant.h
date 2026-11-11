#ifndef CONTESTANT_H
#define CONTESTANT_H

#include "User.h"

class Contestant : public User {
private:
    int contestsParticipated;

public:
    Contestant(
        int id,
        string name,
        string mail,
        string password,
        int contests
    );

    void participateInContest();

    void displayContestantProfile();

    void displayProfile() final override;
};

#endif