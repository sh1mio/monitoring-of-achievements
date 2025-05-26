<?PHP
    mysql_connect("localhost", "artur", "Q5wcNLRfXV4uwajJ");
    mysql_select_db("artur");
    mysql_query("SET NAMES 'utf8'");
    mysql_query("SET CHARACTER SET 'utf8'");
    mysql_query("SET SESSION collation_connection = 'utf8_general_ci'");

    function cmp($a, $b)
    {
        if ($a->count == $b->count) {
            return 0;
        }
        return ($a->count < $b->count) ? 1 : -1;
    }

    //-------------------------------------------------------------
    $ratingurfu = mysql_query("SELECT * FROM ratingurfu;");
    $ratingurfuArr = array();
    $ratingurfuTotal = 0;

    while ($row = mysql_fetch_object($ratingurfu)) {
        $ratingurfuArr[] = $row;
        $ratingurfuTotal += $row->count;
    }

    usort($ratingurfuArr, "cmp");

    //-------------------------------------------------------------
    $ratingurfusports = mysql_query("SELECT * FROM ratingurfusports;");
    $ratingurfusportsArr = array();
    $ratingurfusportsTotal = 0;

    while ($row = mysql_fetch_object($ratingurfusports)) {
        $ratingurfusportsArr[] = $row;
        $ratingurfusportsTotal += $row->count;
    }

    usort($ratingurfusportsArr, "cmp");

    //-------------------------------------------------------------
    $ratingurfuperson = mysql_query("SELECT * FROM ratingurfuperson;");
    $ratingurfupersonArr = array();
    $ratingurfupersonTotal = 0;

    while ($row = mysql_fetch_object($ratingurfuperson)) {
        $ratingurfupersonArr[] = $row;
        $ratingurfupersonTotal += $row->count;
    }

    usort($ratingurfupersonArr, "cmp");

    //-------------------------------------------------------------
    $ratinginstitutions = mysql_query("SELECT * FROM ratinginstitutions;");
    $ratinginstitutionsArr = array();
    $ratinginstitutionsTotal = 0;

    while ($row = mysql_fetch_object($ratinginstitutions)) {
        $ratinginstitutionsArr[] = $row;
        $ratinginstitutionsTotal += $row->count;
    }

    usort($ratinginstitutionsArr, "cmp");
?>

<!DOCTYPE HTML>
<html>

    <head>
        <meta charset="utf-8">
        <title>Рейтинг</title>
    </head>

    <body>
        <table border="1" align="center" width="50%">
            <caption>Рейтинг институтов УрФУ</caption>

            <tr>
                <th></th>
                <th>Институт</th>
                <th>Количество ссылок</th>
                <th>Количество ссылок, %</th>
            </tr>

            <?PHP
                if ($ratingurfu) {
                    foreach ($ratingurfuArr as $key => $value) {
                        $i = $key + 1;
                        $percent = 0;

                        if ($ratingurfuTotal > 0) {
                            $percent = $value->count * 100 / $ratingurfuTotal;
                        }

                        echo "
                            <tr>
                                <td>$i</td>
                                <td>$value->name</td>
                                <td align=\"right\">$value->count</td>
                                <td align=\"right\">$percent</td>
                            </tr>
                            ";
                    }
                }
            ?>
        </table>

        <br>

        <table border="1" align="center" width="50%">
            <caption>Рейтинг видов спорта УрФУ</caption>

            <tr>
                <th></th>
                <th>Вид спорта</th>
                <th>Количество ссылок</th>
                <th>Количество ссылок, %</th>
            </tr>

            <?PHP
                if ($ratingurfusports) {
                    foreach ($ratingurfusportsArr as $key => $value) {
                        $i = $key + 1;
                        $percent = 0;

                        if ($ratingurfusportsTotal > 0) {
                            $percent = $value->count * 100 / $ratingurfusportsTotal;
                        }

                        echo "
                            <tr>
                                <td>$i</td>
                                <td>$value->name</td>
                                <td align=\"right\">$value->count</td>
                                <td align=\"right\">$percent</td>
                            </tr>
                            ";
                    }
                }
            ?>
        </table>

        <br>

        <table border="1" align="center" width="50%">
            <caption>Рейтинг персоналий УрФУ</caption>

            <tr>
                <th></th>
                <th></th>
                <th>Количество ссылок</th>
                <th>Количество ссылок, %</th>
            </tr>

            <?PHP
                if ($ratingurfuperson) {
                    foreach ($ratingurfupersonArr as $key => $value) {
                        $i = $key + 1;
                        $percent = 0;

                        if ($ratingurfupersonTotal > 0) {
                            $percent = $value->count * 100 / $ratingurfupersonTotal;
                        }

                        echo "
                            <tr>
                                <td>$i</td>
                                <td>$value->name</td>
                                <td align=\"right\">$value->count</td>
                                <td align=\"right\">$percent</td>
                            </tr>
                            ";
                    }
                }
            ?>
        </table>

        <br>

        <table border="1" align="center" width="50%">
            <caption>Рейтинг вузов России</caption>

            <tr>
                <th></th>
                <th>Институт</th>
                <th>Количество ссылок</th>
                <th>Количество ссылок, %</th>
            </tr>

            <?PHP
                if ($ratinginstitutions) {
                    foreach ($ratinginstitutionsArr as $key => $value) {
                        $i = $key + 1;
                        $percent = 0;

                        if ($ratinginstitutionsTotal > 0) {
                            $percent = $value->count * 100 / $ratinginstitutionsTotal;
                        }

                        echo "
                            <tr>
                                <td>$i</td>
                                <td>$value->name</td>
                                <td align=\"right\">$value->count</td>
                                <td align=\"right\">$percent</td>
                            </tr>
                            ";
                    }
                }
            ?>
        </table>
    </body>
</html>
