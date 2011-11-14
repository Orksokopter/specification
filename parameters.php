<?php

$data = json_decode(@file_get_contents('parameters_data_storage.dat'), true);

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

if ($_GET['print_as_cpp'])
{
	$cpp_str = 'class Parameters {'."\n".'public:'."\n\t".'enum {'."\n";

	foreach ($data as $le)
		$cpp_str.= "\t\t".$le['key'].' = '.sprintf('0x%06x', $le['type_id']).",\n";
	$cpp_str = substr($cpp_str, 0, -2);

	echo $cpp_str."\n\t".'};'."\n".'};';
}

if ($_GET['print_as_qt'])
{
	$cpp_str = '';

	// Zuerst mal die Parametergruppen zusammenfassen
	$array_sorted_parameters = array();
	foreach ($data as $le)
	{
		$group = substr($le['key'], 0, strpos($le['key'], '_'));

		$array_sorted_parameters[$group][$le['type_id']] = $le['key'];
	}

	// Dann die Parameter innerhalb der Gruppen nach type_id sortieren
	foreach ($array_sorted_parameters as &$le)
		ksort($le);
	unset($le);

	foreach ($array_sorted_parameters as $group => $array_parameters)
	{
		$cpp_str.= '
QGroupBox *'.strtolower($group).'Box = new QGroupBox(tr("'.$group.'"));
QFormLayout *'.strtolower($group).'BoxLayout = new QFormLayout();
'.strtolower($group).'Box->setLayout('.strtolower($group).'BoxLayout);
		';

		foreach ($array_parameters as $type_id => $key)
			$cpp_str.= '
ParameterSpinBox *'.$key.' = new ParameterSpinBox(Parameters::'.$key.');
'.$key.'->setRange(INT_MIN, 2147483647);
m_parameterSpinBoxes.append('.$key.');
'.strtolower($group).'BoxLayout->addRow(tr("'.substr($key, strpos($key, '_')+1).':"), '.$key.');
m_signalMapper->setMapping('.$key.', '.$key.');
connect('.$key.', SIGNAL(valueChanged(int)), m_signalMapper, SLOT(map()));
			';
	}

	$cpp_str = trim($cpp_str)."\n\n";

	foreach ($array_sorted_parameters as $group => $dummy)
		$cpp_str.= 'parameterGroupsLayout->addWidget('.strtolower($group).'Box);'."\n";

	echo substr($cpp_str, 0, -1);
}

if ($_GET['print_as_qt_1'])
{
	$cpp_str = '';

	usort($data, function($a, $b) {
		return strcmp($a['key'], $b['key']);
	});

	foreach ($data as $le)
	{
		if ($cpp_str)
			$cpp_str.= 'else ';
		$cpp_str.= 'if (typeId == Parameters::'.$le['key'].')'."\n\t".'return QString("'.$le['key'].'");'."\n";
	}

	$cpp_str.= "\n".'return QString();';

	echo $cpp_str;
}

if ($_GET['print_as_c'])
{
	$cpp_str = 'enum parameter_type {'."\n";

	foreach ($data as $le)
		$cpp_str.= "\tPARAM_".$le['key'].' = '.sprintf('0x%06x', $le['type_id']).",\n";
	$cpp_str = substr($cpp_str, 0, -2);

	echo $cpp_str."\n".'};';
}

function save()
{
	global $data;
	file_put_contents(__DIR__.'/parameters_data_storage.dat', json_encode($data));
}