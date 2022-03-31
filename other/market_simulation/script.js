window.onload = () => {
	var sell_el = document.getElementById("sell"),
		buy_el	= document.getElementById("buy");

	const ctxPriceChart = document.getElementById('priceChart').getContext('2d');
	const priceChart = new Chart(ctxPriceChart,
		{
			type: "line",
			data: {
				labels: [],
				datasets: [{
				  label: 'Price',
				  backgroundColor: 'rgba(0, 0, 255, .4)',
				  borderColor: 'rgba(0, 0, 255, .4)',
				  data: [],
				}]
			  },
			options: {
				responsive: true,
				maintainAspectRatio: false,
				animation: {
					duration: 100
				},
				plugins: {
					legend: {
						display: false
					},
					title: {
						display: true,
						text: "Цена",
						font: {
							size: 25 
						}
					}
				}
			}
		}
	);	

	const ctxDemandChart = document.getElementById("demandChart").getContext('2d');
	const demandChart = new Chart(ctxDemandChart,
		{
			type: "line",
			data: {
				labels: [],
				datasets: [{
					label: 'Demand',
					backgroundColor: 'rgb(0,0,0)',
					borderColor: 'rgb(0,0,0)',
					data: []
				}],
			},
			options: {
				responsive: true,
				//maintainAspectRatio: false,
				animation: {
					duration: 0
				},
				plugins: {
					legend: {
						display: false
					},
					title: {
						display: true,
						text: "Спрос",
						font: {
							size: 20
						}
					}
				}
			}
		}
	);

	const ctxSupplyChart = document.getElementById("supplyChart").getContext('2d');
	const supplyChart = new Chart(ctxSupplyChart,
		{
			type: "line",
			data: {
				labels: [],
				datasets: [{
					label: 'Demand',
					backgroundColor: 'rgb(0,0,0)',
					borderColor: 'rgb(0,0,0)',
					data: []
				}],
			},
			options: {
				responsive: true,
				//maintainAspectRatio: false,
				animation: {
					duration: 0
				},
				plugins: {
					legend: {
						display: false
					},
					title: {
						display: true,
						text: "Предложение",
						font: {
							size: 20
						}
					}
				}
			}
		}
	);

	var Sellers = [],
		Buyers  = [];
	var PRICE = 1000,
		d_price = 0.5,
		max_count = 1000,
		min_count = 1;
	var length = 0,
		orders_count_limit = 100;
	var d_price = 0.01,
		d       = 0.01;

	var SupplyDemandCountLimit = 15,
		Supply = [],
		Demand = [];

	function removeData(chart, update=true) {
		chart.data.labels.splice(0,1);
		chart.data.datasets.forEach((dataset) => {
			dataset.data.splice(0,1);
		});
		if (update)
			chart.update();
	}
	function addData(chart, label, data, ln, ln_max=100, update=true) {
		chart.data.labels.push(label);
		chart.data.datasets.forEach((dataset) => {
			dataset.data.push(data);
		});
		if (update)
			chart.update();
		if (ln > ln_max) {
			removeData(chart, update);
			ln -= 1;
		}
	}

	function SupplyDemandUpdate() {
		/*
		let SupplyPointsPrice  = [],
			SupplyPointsVolume = [],
			DemandPointsPrice  = [],
			DemandPointsVolume = [];
		*/
		if (Supply.length > SupplyDemandCountLimit)
			Supply.splice(0, 1);
		if (Demand.length > SupplyDemandCountLimit)
			Demand.splice(0, 1);

		let SupplyCopy = [];

		for (let i=0; i<Supply.length; i++) {
			SupplyCopy.push(Supply[i]);
			removeData(supplyChart);
		}
		SupplyCopy.sort((a,b)=>a.count-b.count);

		for (let i=0; i<SupplyCopy.length; i++) {
			addData(supplyChart, SupplyCopy[i].count, SupplyCopy[i].price, 1000, 1000, false);
		}
		supplyChart.update();


		let DemandCopy = [];
		for (let i=0; i<Demand.length; i++) {
			DemandCopy.push(Demand[i]);
			removeData(demandChart);
		}
		DemandCopy.sort((a,b)=>a.count-b.count);

		for (let i=0; i<DemandCopy.length; i++) {
			addData(demandChart, DemandCopy[i].count, DemandCopy[i].price, 1000, 1000, false);
		}
		demandChart.update();	
	}

	function createOrders() {
		let who = Math.round(Math.random()*100);
		if (who % 2 == 0) {
			let Ps = PRICE*(1+Math.random()*d_price+Math.random()*2*d-d),
				count = Math.round(Math.random()*(max_count-min_count)+min_count);
			Sellers.push({
				"count": count,
				"price": Ps
				}
			);
		} else {
			let Pd = PRICE*(1-Math.random()*d_price+Math.random()*2*d-d),
				count = Math.round(Math.random()*(max_count-min_count)+min_count);
			Buyers.push({
				"count": count,
				"price": Pd
				}
			);
		}
	}

	function placeOrders() {
		sell_el.innerHTML = '';
		let html = '';
		for (let i=Sellers.length-1; i>-1; i--) {
			html += `<li>(${Sellers[i].count}) ${Sellers[i].price}</li>`;
		}
		sell_el.innerHTML = html;

		buy_el.innerHTML  = '';
		html = '';
		for (let i=0; i<Buyers.length; i++) {
			html += `<li>(${Buyers[i].count}) ${Buyers[i].price}</li>`;
		}
		buy_el.innerHTML = html;
	}

	function clearOrders() {
		Sellers.sort((a,b) => a.price-b.price);
		Buyers.sort((a,b) => b.price-a.price);
		if (Sellers.length > orders_count_limit) {
			Sellers.splice(orders_count_limit, Sellers.length-orders_count_limit);
		}
		if (Buyers.length > orders_count_limit) {
			Buyers.splice(orders_count_limit, Buyers.length-orders_count_limit);
		}
	}

	function completeOrders() {
		while ((Sellers.length > 0 && Buyers.length > 0) && (Sellers[0].price <= Buyers[0].price)) {
			if (PRICE != Sellers[0].price) {
				PRICE = Sellers[0].price;
				length += 1;
				addData(priceChart, '', PRICE, length, 100);
			}

			Supply.push({
				"count": Sellers[0].count,
				"price": Sellers[0].price
			});
			Demand.push({
				"count": Buyers[0].count,
				"price": Sellers[0].price
			});
			SupplyDemandUpdate();

			let d_count = Sellers[0].count - Buyers[0].count;
			if (d_count == 0) {
				Sellers.splice(0, 1);
				Buyers.splice(0, 1);
			}
			else if (d_count < 0) {
				Buyers[0].count -= Sellers[0].count;
				Sellers.splice(0, 1);
			}
			else if (d_count > 0) {
				Sellers[0].count -= Buyers[0].count;
				Buyers.splice(0, 1);
			}	
		}
	}

	function clearPriceChart() {
		if (length > 100) {
			for (let i=0; i<(length-50); i++) {
				removeData(priceChart);
				length -= 1;
			}
		}
	}

	setInterval(()=>{
		createOrders();

		clearOrders();

		placeOrders();

		completeOrders();

		//clearPriceChart();
	}, 50);
}