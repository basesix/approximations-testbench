define(["vue", "./entriesListStyles.css"], function(Vue){
	
	//Vue component for approximations list entries
	Vue.component('list-entry',{
		props : ["entry"],
		template : `<div class="listEntry" v-on:click="entrySelect">{{entry.name}}</div>`,
		methods : {
			entrySelect : function(e){
				//e is the click event
				
				this.$emit('entryClicked', this.entry);
			}
		}
	})
	
	//Vue component for entries list
	Vue.component('entries-list', {
		props : ["entries"],
		template : `<div class="entriesList"><list-entry
			v-for="(entry, index) in entries"
			v-bind:entry="entry"
			v-bind:key="index"
			v-on:entryClicked="entrySelect"
		></list-entry></div>`,
		methods : {
			entrySelect : function(entry){
				this.$emit('entryClicked', entry);
			}
		}
	});
});

