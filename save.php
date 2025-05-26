<?PHP

$link = mysql_connect("localhost", "artur", "Q5wcNLRfXV4uwajJ");
mysql_select_db("artur");
mysql_query("SET NAMES 'utf8'");
mysql_query("SET CHARACTER SET 'utf8'");
mysql_query("SET SESSION collation_connection = 'utf8_general_ci'");

$pass = "rating";
$urlPass = "";
$urlTable = "";
$urlName = "";
$urlCount = 0;

foreach ($_GET as $key => $value) {
    if ($key == "pass") {
        $urlPass = $value;
    } else if ($key == "table") {
        $urlTable = $value;
    } else if ($key == "name") {
        $urlName = $value;
    } else if ($key == "count") {
        $urlCount = $value;
    }
}

if ($pass == $urlPass) {
    $result0 = mysql_query("CREATE TABLE IF NOT EXISTS `artur`.`$urlTable` (`id` INT(11) UNSIGNED NOT NULL AUTO_INCREMENT, `name` TEXT CHARACTER SET utf8 COLLATE utf8_general_ci NOT NULL, `count` INT(11) UNSIGNED NOT NULL, UNIQUE(`id`));");

    if ($result0) {
        $result1 = mysql_query("SELECT * FROM `artur`.`$urlTable` WHERE `name`='$urlName';");

        if ($result1) {
            $row = mysql_fetch_array($result1, MYSQL_NUM);

            if ($row) {
                $result2 = mysql_query("UPDATE `artur`.`$urlTable` SET `count`='$urlCount' WHERE `name`='$urlName';");
                echo "update $result2\n";
            } else {
                $result3 = mysql_query("INSERT INTO `artur`.`$urlTable` SET `name`='$urlName', `count`='$urlCount';");
                echo "insert $result3\n";
            }
        }
    }
}

mysql_free_result($result0);
mysql_free_result($result1);
mysql_free_result($result2);
mysql_free_result($result3);
mysql_close($link);

?>
