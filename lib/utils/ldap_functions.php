<?php

// define(ROOT_PATH, "../../");
// require_once ROOT_PATH . 'vendor/spyc/spyc.php';
// $GLOBALS['dw_config'] = $dw_config = Spyc::YAMLLoad(ROOT_PATH . 'config.yaml');

// $config = $GLOBALS['dw_config'];
// $ldap_server = $config["ldap"]["ldap_server"];
// $ldap_domain = $config["ldap"]["ldap_domain"];

/**
* Searches the Posts ldap system, using domain and server stored in config.yaml (global)
* Takes username and password, as well as ldap filter, examples of which are included in the
* function body below. Returns an array of objects corresponding to search results. Searches
* with no result return `false`
*/
function twpn_search($ldap_domain, $ldap_server, $query_user, $query_password, $filter) {
	// global $ldap_domain, $ldap_server;
 
  /**
   * DN (Distinguished Name) is a set of RDN (Relative Distinguished name) comma delimited 
   *     components. The DN is passed to ldap_search, along with a connection to the ldap
   *     server, in order to locate records.
   * Our LDAP DN's are composed of the following RDN's
   * -- OU: Organizational Unit (e.g. "News", "Natl Politics and Gov", "TWPN")
   * -- DC: Domain component (e.g. my.ldap.system.com -> dc=my,dc=ldap,dc=system,dc=com)
   * -- CN: Common Name (e.g. "username". NOTE: in PHP ldap_search, CN filters (e.g. CN=*, 
   *     CN=username in DN cause search to hang))
   * Other RDNs exist (e.g. STREET, ST (state), C (Country), UID (User id)) but are not used by 
   * our DN system. Rather, these components are stored in various ldap attributes (countryCode, 
   * employeeID, etc.)
   *
   * In addition to passing DC's that point to the ldap domain, we pass OU=TWPN, an 
   * Organizational unit which includes all users */

    //parse domain into dc's, then contruct dn string from those dc's and TWPN OU
    $domain_dcs = domain_to_dcs($ldap_domain);
    $ldap_dn = "OU=TWPN,".$domain_dcs;
 
    // Connect to the ldap AD (Active directory)
    $ldap = ldap_connect($ldap_server) or die("Could not connect to LDAP");
    // Authenticate by binding user credentials to ldap domain
    ldap_bind($ldap, $query_user."@".$ldap_domain, $query_password) or die("Could not bind to LDAP");

    /** 
    * Search using TWPN DN and filter.
    * Filters search ldap attributes (e.g. objectClass, group, cn, displayName, countryCode, etc)
    * Filters can use logical operators &, |, ! as well as <=, >= (all attributes are strings, so * these are lexicographal comparisons), = and ~= (approx equal to, unclear on how this
    * functions). Example filter strings:
    * "(attr1=val1)" attr1 has value val1
    * "!(attr1=val1)" attr1 has any value but val1
    * "(&(attr1=val1)(attr2=val2))" attr1 has value val1 AND attr2 has value val2
    * "((|(attr1=val1)(attr1=val2))(!attr3=val3))" attr1 has value val1 OR val2 AND attr3 is not 
    *   equal to val3
    */
    $results = ldap_search($ldap,$ldap_dn,$filter);
    $entries = ldap_get_entries($ldap, $results);
    if($entries['count'] == 0) return false;
 	
    return $entries;
}

/**
* Checks if a user is a member of a group, specififed by the group's CN.
* Group records are of the form:
* CN=group_name,OU=Unit name 1,OU=unit name 2,...,DC=my,DC=ldap,DC=system,DC=com
* This function matches group_name and washpost DC's, without specifying OU's.
* My current understanding of washpost ldap system isn't deep enough to be confident in
* specifying rigid OU structure
*/
function memberof_twpn_group($ldap_domain, $ldap_server, $query_user, $query_password, $group){

    $user_record = twpn_search($ldap_domain, $ldap_server, $query_user, $query_password, "(cn=$query_user)");
    $groups = $user_record[0]['memberof'];

    //remove 1st entry of array, which gives count of # of records
    array_shift($groups);

    //regex accepts any OUs, and is case insensitive
    $pattern = "/CN=".$group.",(OU=.+,?)+".domain_to_dcs($ldap_domain)."/i";

    foreach ($groups as $key => $value){
        if(preg_match($pattern,$value)== 1) return true;
    }
    return false;
}

/**
*Parses domain string to comma delimited list of domain components
*/
function domain_to_dcs($domain){
    $domain_dcs = explode(".", $domain);
    $dc_string = "";
    foreach ($domain_dcs as $key => $val) {
        $dc_string .= "DC=".$val;
        if ($key < count($domain_dcs)-1){
            $dc_string .= ",";
        }
    }
    return $dc_string;
}

?>
