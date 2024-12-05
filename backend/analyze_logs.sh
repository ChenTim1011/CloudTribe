#!/bin/bash

# Set the log file paths
LOG_DIR="/var/log/logistics"
ORDER_LOG="$LOG_DIR/orders.log"
DRIVER_LOG="$LOG_DIR/drivers.log"
USER_LOG="$LOG_DIR/user.log"
CONSUMER_LOG="$LOG_DIR/consumer.log"
SELLER_LOG="$LOG_DIR/seller.log"

TODAY=$(date +%Y-%m-%d)

# Define colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}=== 系統分析報告 $(date) ===${NC}\n"

# Order system analysis
echo -e "${GREEN}=== 訂單系統統計 ===${NC}"
echo "今日訂單數："
grep "ORDER_CREATED" $ORDER_LOG | grep $TODAY | wc -l
echo "今日完成訂單數："
grep "ORDER_COMPLETED" $ORDER_LOG | grep $TODAY | wc -l
echo "今日訂單錯誤數："
grep "ORDER.*ERROR" $ORDER_LOG | grep $TODAY | wc -l
echo

# Driver system analysis
echo -e "${GREEN}=== 司機系統統計 ===${NC}"
echo "今日接單數："
grep "ORDER_ACCEPTED" $DRIVER_LOG | grep $TODAY | wc -l
echo "今日新增司機數："
grep "DRIVER_REGISTERED" $DRIVER_LOG | grep $TODAY | wc -l
echo "今日司機系統錯誤數："
grep "ERROR" $DRIVER_LOG | grep $TODAY | wc -l
echo

# User system analysis
echo -e "${GREEN}=== 用戶系統統計 ===${NC}"
echo "今日登入次數："
grep "USER_LOGIN_SUCCESS" $USER_LOG | grep $TODAY | wc -l
echo "今日新註冊用戶數："
grep "USER_REGISTERED" $USER_LOG | grep $TODAY | wc -l
echo "今日登入失敗次數："
grep "USER_LOGIN_FAILED" $USER_LOG | grep $TODAY | wc -l
echo

# Consumer system analysis
echo -e "${GREEN}=== 消費者系統統計 ===${NC}"
echo "今日加入購物車次數："
grep "ADDED_TO_CART" $CONSUMER_LOG | grep $TODAY | wc -l
echo "今日完成購買次數："
grep "PURCHASE_COMPLETED" $CONSUMER_LOG | grep $TODAY | wc -l
echo "今日消費者操作錯誤數："
grep "ERROR" $CONSUMER_LOG | grep $TODAY | wc -l
echo

# Seller system analysis
echo -e "${GREEN}=== 賣家系統統計 ===${NC}"
echo "今日新增商品數："
grep "ITEM_UPLOADED" $SELLER_LOG | grep $TODAY | wc -l
echo "今日上傳圖片數："
grep "IMAGE_UPLOADED" $SELLER_LOG | grep $TODAY | wc -l
echo "今日賣家操作錯誤數："
grep "ERROR" $SELLER_LOG | grep $TODAY | wc -l
echo

# Error logs
echo -e "${RED}=== 最近錯誤記錄 ===${NC}"
echo -e "${YELLOW}最近的訂單錯誤：${NC}"
tail -n 5 $ORDER_LOG | grep "ERROR"
echo -e "${YELLOW}最近的司機系統錯誤：${NC}"
tail -n 5 $DRIVER_LOG | grep "ERROR"
echo -e "${YELLOW}最近的用戶系統錯誤：${NC}"
tail -n 5 $USER_LOG | grep "ERROR"
echo -e "${YELLOW}最近的消費者系統錯誤：${NC}"
tail -n 5 $CONSUMER_LOG | grep "ERROR"
echo -e "${YELLOW}最近的賣家系統錯誤：${NC}"
tail -n 5 $SELLER_LOG | grep "ERROR"

# Performance analysis
echo -e "${BLUE}=== 系統效能分析 ===${NC}"
echo "平均訂單處理時間："
grep "PROCESSING_TIME" $ORDER_LOG | grep $TODAY | awk -F'"' '{sum += $4} END {print sum/NR "ms"}'
echo

echo -e "${BLUE}=== 分析報告完成 ===${NC}"