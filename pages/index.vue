<template>
  <div class="p-4">
    <h1 class="text-2xl font-bold text-center mb-6">八字排盘</h1>

    <van-form @submit="onSubmit">
      <!-- 姓名输入 -->
      <van-field
        v-model="form.name"
        name="name"
        label="姓名"
        placeholder="请输入姓名（可选）"
      />

      <!-- 历法选择 -->
      <van-field name="calendarType" label="历法">
        <template #input>
          <van-radio-group v-model="form.calendarType" direction="horizontal">
            <van-radio name="solar">公历</van-radio>
            <van-radio name="lunar">农历</van-radio>
          </van-radio-group>
        </template>
      </van-field>

      <!-- 闰月开关 -->
      <van-field
        v-if="form.calendarType === 'lunar'"
        name="isLeapMonth"
        label="是否闰月"
      >
        <template #input>
          <van-switch v-model="form.isLeapMonth" />
        </template>
      </van-field>

      <!-- 出生日期选择 -->
      <van-field
        v-model="birthDateText"
        is-link
        readonly
        name="birthDate"
        label="出生日期"
        placeholder="点击选择日期"
        @click="showDatePicker = true"
        :rules="[{ required: true, message: '请选择出生日期' }]"
      />
      <van-popup v-model:show="showDatePicker" position="bottom">
        <van-date-picker
          v-model="currentDate"
          title="选择年月日"
          :min-date="minDate"
          :max-date="maxDate"
          @confirm="onDateConfirm"
          @cancel="showDatePicker = false"
        />
      </van-popup>

      <!-- 出生时辰选择 -->
      <van-field
        v-model="hourText"
        is-link
        readonly
        name="hour"
        label="出生时辰"
        placeholder="点击选择时辰"
        @click="showHourPicker = true"
      />
      <van-popup v-model:show="showHourPicker" position="bottom">
        <van-picker
          :columns="hourColumns"
          title="选择时辰"
          @confirm="onHourConfirm"
          @cancel="showHourPicker = false"
        />
      </van-popup>

      <!-- 性别选择 -->
      <van-field name="gender" label="性别">
        <template #input>
          <van-radio-group v-model="form.gender" direction="horizontal">
            <van-radio name="男">男</van-radio>
            <van-radio name="女">女</van-radio>
          </van-radio-group>
        </template>
      </van-field>

      <!-- 错误提示 -->
      <div v-if="userStore.error" class="text-red-500 text-sm my-2 text-center">
        {{ userStore.error }}
      </div>

      <!-- 提交按钮 -->
      <div class="mt-6">
        <van-button
          round
          block
          type="primary"
          native-type="submit"
          :loading="userStore.loading"
          loading-text="正在排盘..."
        >
          立即排盘
        </van-button>
      </div>
    </van-form>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from "vue";
import { useUserStore } from "~/stores/user";
import { Lunar, Solar } from "lunar-javascript";
import { showToast } from "vant";
import "vant/es/toast/style";

// 获取用户 store
const userStore = useUserStore();

// 表单响应式数据
const form = ref({
  name: "",
  calendarType: "solar", // solar 或 lunar
  isLeapMonth: false, // 是否闰月
  year: new Date().getFullYear(),
  month: new Date().getMonth() + 1,
  day: new Date().getDate(),
  hour: -1, // -1 代表未知时辰
  gender: "男",
});

// Vant 组件状态
const showDatePicker = ref(false);
const showHourPicker = ref(false);
const minDate = new Date(1900, 0, 1);
const maxDate = new Date();
// 初始化 currentDate，确保是字符串数组
const currentDate = ref([
  String(form.value.year),
  String(form.value.month).padStart(2, "0"),
  String(form.value.day).padStart(2, "0"),
]);

// 时辰选项
const hourColumns = [
  { text: "未知", value: -1 },
  { text: "子时 (00:00-00:59)", value: 0 },
  { text: "丑时 (01:00-02:59)", value: 1 },
  { text: "寅时 (03:00-04:59)", value: 3 },
  { text: "卯时 (05:00-06:59)", value: 5 },
  { text: "辰时 (07:00-08:59)", value: 7 },
  { text: "巳时 (09:00-10:59)", value: 9 },
  { text: "午时 (11:00-12:59)", value: 11 },
  { text: "未时 (13:00-14:59)", value: 13 },
  { text: "申时 (15:00-16:59)", value: 15 },
  { text: "酉时 (17:00-18:59)", value: 17 },
  { text: "戌时 (19:00-20:59)", value: 19 },
  { text: "亥时 (21:00-22:59)", value: 21 },
  { text: "子时 (23:00-23:59)", value: 23 },
];

// 计算属性，用于显示选择的日期和时辰
const birthDateText = computed(() => {
  return `${form.value.year}年${form.value.month}月${form.value.day}日`;
});

const hourText = computed(() => {
  const selected = hourColumns.find((h) => h.value === form.value.hour);
  return selected ? selected.text : "";
});

// 日期确认
const onDateConfirm = ({
  selectedValues,
}: {
  selectedValues: (string | undefined)[];
}) => {
  // 增加非空校验
  if (selectedValues[0] && selectedValues[1] && selectedValues[2]) {
    form.value.year = parseInt(selectedValues[0], 10);
    form.value.month = parseInt(selectedValues[1], 10);
    form.value.day = parseInt(selectedValues[2], 10);
    currentDate.value = [
      String(selectedValues[0]),
      String(selectedValues[1]).padStart(2, "0"),
      String(selectedValues[2]).padStart(2, "0"),
    ];
  }
  showDatePicker.value = false;
};

// 时辰确认
const onHourConfirm = ({ selectedOptions }: { selectedOptions: any[] }) => {
  form.value.hour = selectedOptions[0].value;
  showHourPicker.value = false;
};

// 提交表单事件
const onSubmit = async () => {
  let solarYear = form.value.year;
  let solarMonth = form.value.month;
  let solarDay = form.value.day;

  // 如果是农历，转换为公历
  if (form.value.calendarType === "lunar") {
    try {
      // 修正 API 调用，并处理闰月
      let monthParam = form.value.month;
      if (form.value.isLeapMonth) {
        // lunar-javascript 中闰月用负数表示
        monthParam = -form.value.month;
      }

      // @ts-ignore: lunar-javascript 的类型定义可能不完整，但 API 实际存在
      const lunar = Lunar.fromYmd(form.value.year, monthParam, form.value.day);
      const solar = lunar.getSolar();

      solarYear = solar.getYear();
      solarMonth = solar.getMonth();
      solarDay = solar.getDay();
    } catch (e) {
      console.error("农历转公历失败:", e);
      showToast("无效的农历日期，请检查输入（特别是闰月）。");
      return;
    }
  }

  // 更新 store
  userStore.form.name = form.value.name;
  userStore.form.year = solarYear;
  userStore.form.month = solarMonth;
  userStore.form.day = solarDay;
  userStore.form.hour = form.value.hour;
  userStore.form.gender = form.value.gender;
  userStore.form.calendarType = form.value.calendarType;

  const result = await userStore.submitPaiPan();
  if (result && result.id) {
    await navigateTo(`/result?id=${result.id}`);
  }
};
</script>
