#ifndef ACCOUNT_H
#define ACCOUNT_H

#include <string>
using namespace std;

class User;

class Account {
private:
    int accountId;
    string accountInfo;

public:
    Account(int id, string info);

    void createAccount();
    bool authenticate(string info);

    int getAccountId() const;

    friend bool operator==(const User& user, const Account& account);
};

#endif