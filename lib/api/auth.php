<?php

/* get session info */
$app->get('/account', function() {
    try {
        $r = DatawrapperSession::toArray();
        ok($r);
    } catch (Exception $e) {
        error('exception', $e->getMessage());
    }
});

/* get current language */
$app->get('/account/lang', function() use ($app) {
    ok(DatawrapperSession::getLanguage());
});

/* set a new language */
$app->put('/account/lang', function() use ($app) {
    $data = json_decode($app->request()->getBody());
    DatawrapperSession::setLanguage( $data->lang );
    ok();
});


/* login user */
$app->post('/auth/login', function() use($app) {
    $payload = json_decode($app->request()->getBody());
    // First, check username against LDAP
    $user = $payload->user;
    $ds=ldap_connect("ldaptc.twpn.root.washpost.com");
    try {
        $r = ldap_bind($ds, "${user}@TWPN.ROOT.WASHPOST.COM", $payload->password);
        $user = UserQuery::create()->findOneByEmail($payload->user);

        if (!empty($user)) {
            DatawrapperSession::login($user, $payload->keeplogin == true);
            ok();
        } else {
            $user = new User();
            $user->setCreatedAt(time());
            $user->setEmail($payload->user);
            $user->setPwd("via_ldap");
            $user->setLanguage("en_US");
            $user->setRole("editor");
            $user->save();
            DatawrapperSession::login($user, $payload->keeplogin == true);
            ok();
        }
    } catch (Exception $e) {
        error('login-email-unknown', __('Please double check your credentials.'));
    }
});

/* return the server salt for secure auth */
$app->get('/auth/salt', function() use ($app) {
    ok(array('salt' => DW_AUTH_SALT));
});

/*
 *logs out the current user
 */
$app->post('/auth/logout', function() {
    $user = DatawrapperSession::getUser();
    if ($user->isLoggedIn()) {
        DatawrapperSession::logout();
        ok();
    } else {
        error('not-loggin-in', 'you cannot logout if you\'re not logged in');
    }
});

