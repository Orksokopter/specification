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
	
	usort($data, function($a, $b) {
		return strcmp($a['key'], $b['key']);
	});
	
	$curr_group = '';
	$groups = array();
	foreach ($data as $le)
	{
		$group = substr($le['key'], 0, strpos($le['key'], '_'));
		
		if ($group != $curr_group)
		{
			$curr_group = $group;
			$cpp_str.= '
QGroupBox *'.strtolower($curr_group).'Box = new QGroupBox(tr("'.$curr_group.'"));
QFormLayout *'.strtolower($curr_group).'BoxLayout = new QFormLayout();
'.strtolower($curr_group).'Box->setLayout('.strtolower($curr_group).'BoxLayout);
			';
			
			$groups[] = $curr_group;
		}
		
		$cpp_str.= '
ParameterSpinBox *'.$le['key'].' = new ParameterSpinBox(Parameters::'.$le['key'].');
m_parameterSpinBoxes.append('.$le['key'].');
'.$le['key'].'->setValue(settings.value("'.$le['key'].'", 0).toInt());
'.strtolower($curr_group).'BoxLayout->addRow(tr("'.substr($le['key'], strpos($le['key'], '_')+1).':"), '.$le['key'].');
		';
	}
	
	$cpp_str = trim($cpp_str)."\n\n";
	
	foreach ($groups as $le)
		$cpp_str.= 'parameterGroupsLayout->addWidget('.strtolower($le).'Box);'."\n";

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
		$cpp_str.= "\t".$le['key'].' = '.sprintf('0x%06x', $le['type_id']).",\n";
	$cpp_str = substr($cpp_str, 0, -2);

	echo $cpp_str."\n".'};';
}

function save()
{
	global $data;
	file_put_contents(__DIR__.'/parameters_data_storage.dat', json_encode($data));
}