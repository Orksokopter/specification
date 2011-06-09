<?php

$data = @file_get_contents('spec_data_storage.dat');

ob_start("ob_gzhandler");
header('Content-Type: text/html; charset=utf-8');

exec('sudo -u dropbox /home/dropbox/permfix', $array_output);

if (!$_POST['new_html'])
	echo $data;
else
{
	$data = $_POST['new_html'];
	save();
}

function save()
{
	global $data;
	file_put_contents(__DIR__.'/spec_data_storage.dat', $data);
}