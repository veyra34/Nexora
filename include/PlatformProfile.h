#ifndef PLATFORMPROFILE_H
#define PLATFORMPROFILE_H

#include "User.h"
#include <iostream>

using namespace std;

class PlatformProfile : virtual public User {
public:
    PlatformProfile(
        int id,
        string name,
        string email,
        string password
    )
        : User(id, name, email, password) {
    }

    void showPlatformProfile() {
        cout << "Coding Platform Profile" << endl;
    }
};

#endif