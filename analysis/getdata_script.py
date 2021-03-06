import numpy as np
import pandas as pd
N = 31

def get_data( file, rt=False, age_sex=False):
	#### function for getting data from a .csv file ###
	df = pd.read_csv(file)
	# print(df.columns)
	del df['view_history']
	if(rt == False):
		del df['rt']
	del df['trial_type']
	del df['trial_index']
	del df['time_elapsed']
	del df['internal_node_id']
	del df['subject']
	del df['phase']

	if (age_sex == True):
		import ast
		age = ast.literal_eval(df['responses'][1])['Q1']
		if (age == ''):
			age = 'BRAK'
		else:
			age = int(age)
		df['age'] = age
		sex = ast.literal_eval(df['responses'][2])['Q0']
		df['sex'] = sex

	del df['responses']

	df = df.ix[4:N+3]
	df = df.reset_index(drop=True)

	df['converted'] = [0]*N
	df['deviation'] = [0]*N


	for i, val in enumerate(df['stimulus']):
		if (isinstance(val, str)):
			df.loc[i, 'stimulus'] = int(val[14:17])
			df.loc[i,'converted'] = 200 * (df['sim_score'][i]-1) / 99 + 7
			df.loc[i, 'deviation'] = df.loc[i, 'converted'] - df.loc[i, 'stimulus']

	return df

def all_data_convert(name, RT=False, Age_sex=False):
	#returns a list of DataFrames with individual data
	import glob
	filenames = glob.glob(name+"*.csv")
	data = []
	for filename in filenames:
		# print(filename)
		data.append(get_data(filename, rt=RT, age_sex=Age_sex))

	return data


import matplotlib.pyplot as plt

def plot_data( df, name ):
	# df = df.sort(['stimulus'])
	df = df.sort_values(by=['stimulus'])
	plt.plot(df['stimulus'], df['converted'], 'r-')
	plt.plot([0, 200], [0, 200], 'k-')
	plt.savefig(name+'.png')

	return

def plot_all_data( d, name ):
	for df in d:
		# df = df.sort(['stimulus'])
		# plt.plot(df.sort(['stimulus'])['stimulus'], df.sort(['stimulus'])['converted'], 'r-')
		plt.plot(df.sort_values(by=['stimulus'])['stimulus'], df.sort_values(by=['stimulus'])['converted'], 'r-')
		plt.plot([0, 200], [0, 200], 'k-')
	plt.savefig(name+'.png')

	return

def data_analysis (df):

	df['deviation'] = [0]*N



	for i, row in df.iterrows():
		# df.loc[i, 'deviation'] = row['converted']-row['stimulus']
		row['deviation'] = row['converted']-row['stimulus']
		# df.loc[i, 'SD'] =
	return df

def var_dev():
	#funkcja zwaracająca sumę odchyleń (sum_dev) i sumę kwadratów odchyleń (sum_sdev) dla poszczególnych plików z danymi
	# w związku z dużymi różnicami dev i sdev rysowanie ich razem na jednym wykresie jest trochę bez sensu
	import glob
	filenames = glob.glob("badanie1*.csv")
	data = []
	df = pd.DataFrame()

	sum_dev = []
	sum_sdev = []
	for name in filenames:

		temp = GetData(name)
		dev = sum(abs(temp['deviation']))

		sum_dev.append((dev))
		sum_sdev.append(dev*dev)

	df['sum_dev'] = sum_dev
	df['sum_sdev'] = sum_sdev
	df['name'] = filenames


	return df


def all_data(path):
	import glob
	filenames = glob.glob(path+'badanie1*.csv')
	data = []
	for filename in filenames:
		data.append(get_data(filename))

	avg_data = pd.DataFrame()
	avg_data['stimulus'] = data[1]['stimulus']

	m = []
	sd = []
	for i in range(31):
		m.append(np.mean([x for x in [xx.loc[i, 'converted'] for xx in data]]))
		sd.append(np.std([x for x in [xx.loc[i, 'converted'] for xx in data]]))
	avg_data['mean'] = m
	avg_data['SD'] = sd
	avg_data = avg_data.sort_values('stimulus').reset_index(drop=True)

	# plot_all_data(data, 'alldata')
	# for d in data[1:]:
	# 	for j in range(31):
	# 		mean.loc[j, 'converted'] += d.loc[j, 'converted']
	# 		mean.loc[j, 'deviation'] += d.loc[j, 'deviation']
	# # mean['deviation'] = mean['converted'] - mean['stimulus']

	# # mean['SD']=

	# for j in range(31):
	# 	mean.loc[j, 'converted'] /= i
	# 	mean.loc[j, 'deviation'] /= i
		# for d in data:
		# 	mean.loc[j, 'SD'] += (d['deviation']-mean['deviation'][j])^2


	data2 = []
	for d in data:
		data2.append(d.sort_values('stimulus').reset_index(drop=True))

	return avg_data, data2

def all_data_info(path):
	# fuction returning lists with age and sex for statistics
	import glob
	filenames = glob.glob(path+'badanie1*.csv')
	age, sex = [], []
	for filename in filenames:
		data = get_data(filename, age_sex=True)
		# print(data['age'].loc[0])
		age.append(data['age'].loc[0])
		sex.append(data['sex'].loc[0])

	return age, sex


def correlation():

	#będzie zwracać korelacje zaczernienia obrazka z liczbą punktów na obrazku
	# i korelacje zaczernienia z odpowiedziami ludzi

	#import modułu z innej lokalizacji
	import importlib.util
	spec = importlib.util.spec_from_file_location("img_script", "../experiment/img/img_script.py")
	img = importlib.util.module_from_spec(spec)
	spec.loader.exec_module(img)

	df_perc = img.Script("../experiment/img/dots")

	df = all_data()
	#trzeba tutaj dodać te dwa data framy

	# df['percentage']

	return df_perc
