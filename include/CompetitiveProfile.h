#ifndef COMPETITIVEPROFILE_H
#define COMPETITIVEPROFILE_H

#include "User.h"
#include <iostream>

using namespace std;

class CompetitiveProfile : virtual public User {
public:
    CompetitiveProfile(
        int id,
        string name,
        string email,
        string password
    )
        : User(id, name, email, password) {
    }

    void showCompetitiveProfile() {
        cout << "Competitive Programming Profile" << endl;
    }
};

#endif