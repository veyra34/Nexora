#include "../include/User.h"
#include <iostream>

using namespace std;

int User::totalUsers = 0;

User::User(int id, string username, string email, string password) {
    this->userId = id;
    this->username = username;
    this->email = email;
    this->password = password;

    totalUsers++;
}

bool User::login(string enteredPassword) {
    return password == enteredPassword;
}

void User::displayProfile() {
    cout << "User ID: " << userId << endl;
    cout << "Username: " << username << endl;
    cout << "Email: " << email << endl;
}

string User::getUsername() const {
    return username;
}

string User::getEmail() const {
    return email;
}

int User::getTotalUsers() {
    return totalUsers;
}