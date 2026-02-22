<script setup lang="ts">
import { computed } from 'vue';

import { getRichTextResolvers } from '#utils/getRichTextResolvers.ts';
import { t } from '#utils/i18n.ts';
import { trackNavigationClick } from '#utils/tracking.ts';

import Button from '#components/utils/Button.vue';
import RichText from '#components/utils/RichText.vue';

import type { StoryblokServiceOffer, StoryblokServiceOffersComparison } from '#types/component-types-sb.js';

// Props :
const { blok, offers } = defineProps<{
	blok: StoryblokServiceOffersComparison;
	offers: StoryblokServiceOffer[];
}>();

// Resolvers (RichText) :
const resolvers = getRichTextResolvers('h2');

// Config :
interface ComparisonSection {
	titleKey: string;
	descriptionKey?: string;
	showOfferTitles?: boolean;
	rows: ComparisonRow[];
}

interface ComparisonRow {
	labelKey: string;
	field?: keyof StoryblokServiceOffer;
	suffix?: string;
	suffixKey?: string;
	suffixKeySingular?: string;
	staticValue?: string;
	isFullWidth?: boolean;
}

const comparisonConfig = computed<ComparisonSection[]>(() => [
	{
		titleKey: 'offersComparisonTitleDetails',
		showOfferTitles: true,
		rows: [
			{ labelKey: 'offersComparisonOffersPrice', field: 'price', suffix: '€' },
			{
				labelKey: 'offersComparisonOffersDuration',
				field: 'duration',
				suffixKey: 'offersComparisonHours',
				suffixKeySingular: 'offersComparisonHour'
			},
			{ labelKey: 'offersComparisonOffersNumberOfEditedPhotos', field: 'numberOfEditedPhotos' },
			{ labelKey: 'offersComparisonOffersNumberOfBlackAndWhitePhotos', field: 'numberOfBlackAndWhitePhotos' }
		]
	},
	{
		titleKey: 'offersComparisonTitleAdditionalServices',
		descriptionKey: 'offersComparisonDescriptionAdditionalServices',
		rows: [
			{ labelKey: 'offersComparisonAdditionalPhoto', staticValue: '8€' },
			{ labelKey: 'offersComparisonAdditionalPhotosPack', staticValue: '35€' },
			{ labelKey: 'offersComparisonAllBlackAndWhitePhotos', staticValue: '+25%' }
		]
	},
	{
		titleKey: 'offersComparisonTitleServicesOnDemand',
		descriptionKey: 'offersComparisonDescriptionServicesOnDemand',
		rows: [
			{ labelKey: 'offersComparisonDemandByEmail', isFullWidth: true },
			{ labelKey: 'offersComparisonDemandFormats', isFullWidth: true }
		]
	}
]);

// Methods :
const getFormattedSuffix = (row: ComparisonRow, value: any) => {
	if (!row.suffixKey) return '';

	const key = row.suffixKeySingular && String(value) === '1' ? row.suffixKeySingular : row.suffixKey;
	return ` ${t(key)}`;
};
</script>

<template>
	<section class="modules service-offers-comparison">
		<div class="container">
			<div class="title-container">
				<RichText v-animate="'reveal-titles'" :doc="blok.title" :resolvers="resolvers" />
				<Button
					v-if="blok.brochure.filename"
					v-animate="{ type: 'reveal-button-dot', options: { delay: 0.25 } }"
					theme="dot-dark"
					:text="$t('downloadTheBrochure')"
					:to="blok.brochure.filename"
					target="_blank"
					@click="trackNavigationClick"
				/>
			</div>

			<div class="comparison-container">
				<div v-for="section in comparisonConfig" :key="section.titleKey" class="section-container">
					<div class="header-container">
						<div
							class="header-wrapper col-start-1 col-end-13 col-start-tb-1 col-end-tb-7 col-start-dk-1 col-end-dk-14"
						>
							<div v-animate="'reveal-paragraphs'" class="title">{{ $t(section.titleKey) }}</div>
							<p
								v-if="section.descriptionKey"
								v-animate="{ type: 'reveal-paragraphs', options: { delay: 0.1 } }"
								class="description"
							>
								{{ $t(section.descriptionKey) }}
							</p>
						</div>

						<ul
							v-if="section.showOfferTitles"
							class="offers-wrapper hide-mobile-tablet col-start-1 col-end-13 col-start-tb-7 col-end-tb-17 col-start-dk-14 col-end-dk-33 col-start-mlg-14 col-end-mlg-33"
						>
							<li v-for="(offer, index) in offers" :key="offer._uid">
								<span
									v-animate="{ type: 'reveal-paragraphs', options: { delay: 0.125 + index * 0.125 } }"
									>{{ offer.title }}</span
								>
							</li>
						</ul>
					</div>

					<div v-for="row in section.rows" :key="row.labelKey" class="items-container">
						<div
							class="header-wrapper"
							:class="
								row.isFullWidth
									? 'col-start-1 col-end-13 col-start-tb-1 col-end-tb-17 col-start-dk-1 col-end-dk-33'
									: 'col-start-1 col-end-13 col-start-tb-1 col-end-tb-7 col-start-dk-1 col-end-dk-14'
							"
						>
							<div v-animate="'reveal-paragraphs'" class="title">{{ $t(row.labelKey) }}</div>
						</div>

						<ul
							v-if="!row.isFullWidth"
							class="offers-wrapper col-start-1 col-end-13 col-start-tb-7 col-end-tb-17 col-start-dk-14 col-end-dk-33 col-start-mlg-14 col-end-mlg-33"
						>
							<li v-for="(offer, index) in offers" :key="offer._uid">
								<span
									v-animate="{ type: 'reveal-paragraphs', options: { delay: 0.125 + index * 0.125 } }"
									class="hide-desktop"
									>{{ offer.title }}</span
								>
								<span
									v-animate="{ type: 'reveal-paragraphs', options: { delay: 0.125 + index * 0.125 } }"
								>
									<template v-if="row.field">
										{{ offer[row.field] }}{{ row.suffix
										}}{{ getFormattedSuffix(row, offer[row.field]) }}
									</template>
									<template v-else-if="row.staticValue">
										{{ row.staticValue }}
									</template>
								</span>
							</li>
						</ul>
					</div>
				</div>
			</div>
		</div>
	</section>
</template>

<style lang="scss" scoped>
.service-offers-comparison {
	padding-block: fluidSize(80px, 56px) fluidSize(48px, 36px);
}

.title-container {
	display: flex;
	flex-direction: column;
	gap: fluidSize(10px, 8px);
	margin-block-end: fluidSize(72px, 48px);

	@include mq(tablet) {
		text-align: right;
		align-items: flex-end;
	}

	& > :deep(.partials-rich-text) {
		@include roobert-48;

		text-wrap: pretty;

		em {
			@include romie-48-italic;
		}
	}
}

.comparison-container {
	display: flex;
	flex-direction: column;
	gap: fluidSize(52px, 36px);
}

.section-container {
	display: flex;
	flex-direction: column;
}

.header-container {
	@include grid;

	margin-block-end: fluidSize(16px, 14px);

	.title {
		@include roobert-16-uppercase;
	}

	.description {
		@include roobert-14;

		color: $khaki;
		max-width: fluidSize(480px, 420px);
	}
}

.header-wrapper {
	display: flex;
	flex-direction: column;
	gap: fluidSize(8px, 6px);
}

.items-container {
	border-top: 1px solid $eerieBlack;

	@include mq($until: desktop) {
		padding-block: fluidSize(18px, 16px) fluidSize(20px, 18px);
	}

	@include mq(desktop) {
		@include grid;

		padding-block: fluidSize(14px, 12px) fluidSize(16px, 14px);
	}
}

.offers-wrapper {
	display: flex;

	@include mq($until: desktop) {
		flex-direction: column;
		gap: fluidSize(10px, 8px);
		margin-block-start: fluidSize(20px, 16px);
	}

	@include mq(desktop) {
		align-items: center;
		justify-content: space-around;
	}

	li {
		@include mq($until: desktop) {
			display: flex;
			align-items: center;
			justify-content: space-between;
		}

		span {
			@include roobert-16-uppercase;
		}
	}
}
</style>
