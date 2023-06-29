#
#Diese Datei ist Teil der Bachelorarbeit von Fabian Schoettler
#Martrikelnummer : 1111 0647
#Stand : 13.03.2019
#

#this program is user to alter the adminpw
from noc_server import User, db
from werkzeug.security import generate_password_hash

def getAdminPW():
    newPw1 = raw_input("Enter new admin pw! : \n")
    newPw2 = raw_input("Confirm new admin pw : \n")
    if newPw1 == newPw2:
        print("check! Admin PW has been changed!")
        return newPw1
    else:
        print("ERROR: The two inputs havent been equal -> Try again!")
        return getAdminPW()

tmpUser = User.query.filter_by(username="admin").first()

#console line input
tmpPw = getAdminPW()

hashedPw = generate_password_hash( tmpPw, method='sha256' )

if tmpUser is not None:
    tmpUser.password = hashedPw
else:
    tmpUser = User( username="admin", password=hashedPw )

db.session.add( tmpUser )
db.session.commit()
