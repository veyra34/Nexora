#include "../include/Account.h"
#include "../include/User.h"
#include <iostream>

using namespace std;

Account::Account(int id, string info) {
    this->accountId = id;
    this->accountInfo = info;
}

void Account::createAccount() {
    cout << "Account created successfully." << endl;
}

bool Account::authenticate(string info) {
    return accountInfo == info;
}

int Account::getAccountId() const {
    return accountId;
}

bool operator==(const User& user, const Account& account) {
    return user.email == account.accountInfo;
}