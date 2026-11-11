#ifndef NEXORAMEMBER_H
#define NEXORAMEMBER_H

#include "CompetitiveProfile.h"
#include "PlatformProfile.h"

class NexoraMember
    : public CompetitiveProfile,
      public PlatformProfile {

public:
    NexoraMember(
        int id,
        string name,
        string email,
        string password
    )
        : User(id, name, email, password),
          CompetitiveProfile(id, name, email, password),
          PlatformProfile(id, name, email, password) {
    }

    void displayMember() {
        displayProfile();
        showCompetitiveProfile();
        showPlatformProfile();
    }
};

#endif