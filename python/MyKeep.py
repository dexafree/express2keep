import gkeepapi

class MyKeep(gkeepapi.Keep):

    def __init__(self, mac):
        super(MyKeep, self).__init__()
        self.mac = mac

    def login(self, username, password, state=None, sync=True):
        """Authenticate to Google with the provided credentials & sync.

        Args:
            email (str): The account to use.
            password (str): The account password.
            state (dict): Serialized state to load.

        Raises:
            LoginException: If there was a problem logging in.
        """
        auth = gkeepapi.APIAuth(self.OAUTH_SCOPES)

        ret = auth.login(username, password, self.mac)
        if ret:
            self.load(auth, state, sync)

        return ret