<?php

$data = json_decode(@file_get_contents('messages_data_storage.dat'), true);

usort($data, function($a, $b) {
	if ($a['type_id'] == $b['type_id'])
		return 0;
	else
		return ($a['type_id'] < $b['type_id'] ? -1 : 1);
});

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
		'key' => $tmp['key'],
		'data' => $tmp['data'],
		'flags' => $tmp['flags']
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

if ($_GET['print_as_cpp'])
{
	$cpp_str = 'class MessageTypes {'."\n".'public:'."\n\t".'enum {'."\n";

	foreach ($data as $le)
		$cpp_str.= "\t\t".$le['key'].' = '.sprintf('0x%06x', $le['type_id']).",\n";
	$cpp_str = substr($cpp_str, 0, -2);

	echo $cpp_str."\n\t".'};'."\n".'};';
}

if ($_GET['print_as_c'])
{
	$cpp_str = 'enum message_type {'."\n";

	foreach ($data as $le)
		$cpp_str.= "\tMSG_".$le['key'].' = '.sprintf('0x%06x', $le['type_id']).",\n";
	$cpp_str = substr($cpp_str, 0, -2);

	echo $cpp_str."\n".'};';
}

function save()
{
	global $data;
	file_put_contents(__DIR__.'/messages_data_storage.dat', json_encode($data));
}