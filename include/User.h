#ifndef USER_H
#define USER_H

#include <string>
using namespace std;

class Account;

class User {
private:
    string username;
    string email;
    string password;

    static int totalUsers;

protected:
    int userId;

public:
    User(int id, string username, string email, string password);

    bool login(string enteredPassword);

    virtual void displayProfile();

    string getUsername() const;
    string getEmail() const;

    static int getTotalUsers();

    friend bool operator==(const User& user, const Account& account);
};

#endif