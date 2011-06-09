<?php

$data = json_decode(@file_get_contents('parameters_data_storage.dat'), true);

ob_start("ob_gzhandler");
header('Content-Type: text/html; charset=utf-8');

exec('sudo -u dropbox /home/dropbox/permfix', $array_output);

if ($_GET['read'])
{
	$array_json = array();

	if (is_array($data))
		foreach ($data as $index => $le)
		{
			$array_json[] = $le + array('index' => $index);
		}

	echo json_encode(array('entries' => $array_json));
}

if ($_GET['update'])
{
	$tmp = json_decode($_POST['entries'], true);

	foreach ($tmp as $key => $le)
	{
		if ($key == 'index')
			continue;
		else
			$data[$tmp['index']][$key] = $le;
	}

	echo json_encode(array('success' => true, 'entries' => $tmp));

	save();
}

if ($_GET['create'])
{
	$tmp = json_decode($_POST['entries'], true);

	$neulol = array(
		'type_id' => $tmp['type_id'],
		'key' => $tmp['key']
	);

	$data[] = $neulol;
	end($data);
	$index = key($data);

	echo json_encode(array(
		'success' => true,
		'entries' => $neulol + array('index' => $index)
	));

	save();
}

if ($_GET['destroy'])
{
	$tmp = json_decode($_POST['entries'], true);

	unset($data[$tmp['index']]);

	echo json_encode(array(
		'success' => true
	));

	save();
}

function save()
{
	global $data;
	file_put_contents(__DIR__.'/parameters_data_storage.dat', json_encode($data));
}